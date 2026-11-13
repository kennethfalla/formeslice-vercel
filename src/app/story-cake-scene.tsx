"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  ACESFilmicToneMapping, CylinderGeometry, DirectionalLight, HemisphereLight, Mesh, MeshStandardMaterial,
  OrthographicCamera, PCFShadowMap, PlaneGeometry, Scene, ShadowMaterial, WebGLRenderer,
} from "three";
import { buildCake, createSpongeTexture, disposeMeshes } from "./cake-model";
import { storyCakeFlavors } from "./cake-recipe";
import { getStoryLayers, type StoryCakePose } from "./story-cake-layout";


export function StoryCakeScene({ pose, draw, onReady }: {
  pose: RefObject<StoryCakePose>;
  draw: RefObject<(() => void) | null>;
  onReady: (ready: boolean) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const stage = host;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    host.append(renderer.domElement);

    const scene = new Scene();
    const camera = new OrthographicCamera(-2, 2, 2, -2, .1, 30);
    scene.add(new HemisphereLight("#fff6ee", "#ba9182", 1.65));
    const key = new DirectionalLight("#fff3e7", 2.6);
    key.position.set(-3, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -4;
    key.shadow.camera.right = key.shadow.camera.top = 4;
    key.shadow.normalBias = .022;
    scene.add(key);
    const fill = new DirectionalLight("#fff5ec", 1);
    fill.position.set(4, 4, -4);
    scene.add(fill);

    const ground = new Mesh(new PlaneGeometry(30, 30), new ShadowMaterial({ opacity: .16 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const plate = new Mesh(new CylinderGeometry(1.66, 1.59, .1, 96), new MeshStandardMaterial({ color: "#faf2e9", roughness: .5 }));
    plate.position.y = .055;
    plate.receiveShadow = true;
    scene.add(plate);

    let contextLost = false;
    const sponge = createSpongeTexture(renderer, () => {
      if (contextLost) return;
      render();
      onReady(true);
    });
    const { cake, layers, toppings } = buildCake({ formation: "stack", flavors: [...storyCakeFlavors].reverse() }, sponge.texture);
    scene.add(cake);
    let aspect = 1;

    function render() {
      if (contextLost) return;
      const { separation, chapter } = pose.current;
      const assembledHeight = Math.max(1.62, 1.87 / aspect);
      const openHeight = Math.max(2.18, 1.95 / aspect);
      const halfHeight = assembledHeight + (openHeight - assembledHeight) * separation;
      const center = 1.24 + separation * 1.16;
      camera.position.set(1.5 * (1 - separation), center + 1.52 - separation * 1.29, 7.2);
      camera.lookAt(0, center, 0);
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.updateProjectionMatrix();

      const layout = getStoryLayers(chapter);
      const openWidth = openHeight * aspect * .80 / 1.42;
      cake.scale.x = 1 + (openWidth - 1) * separation;
      layers.forEach((layer, index) => {
        const { top, height, emphasis } = layout[layers.length - 1 - index];
        const base = .12 + index * .4;
        const openBase = center + halfHeight * (1 - 2 * (top + height));
        layer.position.set(0, base + (openBase - base) * separation, emphasis * separation * .16);
        layer.scale.y = 1 + (2 * halfHeight * height / .4 - 1) * separation;
      });
      toppings.position.y = .407 - separation * .025;
      toppings.scale.set(1 / cake.scale.x, 1 / layers[layers.length - 1].scale.y, 1);
      plate.position.y = layers[0].position.y - .065;
      plate.scale.x = cake.scale.x;
      ground.material.opacity = .16 * (1 - separation);
      renderer.render(scene, camera);
    }

    function resize() {
      const { clientWidth: width, clientHeight: height } = stage;
      if (!width || !height) return;
      aspect = width / height;
      renderer.setSize(width, height, false);
      render();
    }

    function loseContext(event: Event) {
      event.preventDefault();
      contextLost = true;
      onReady(false);
    }

    draw.current = render;
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    renderer.domElement.addEventListener("webglcontextlost", loseContext);
    resize();

    return () => {
      draw.current = null;
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", loseContext);
      renderer.domElement.remove();
      sponge.dispose();
      disposeMeshes(scene);
      key.shadow.dispose();
      renderer.dispose();
    };
  }, [draw, onReady, pose]);

  return <div className="story-cake-canvas" ref={mount} aria-hidden="true" />;
}
