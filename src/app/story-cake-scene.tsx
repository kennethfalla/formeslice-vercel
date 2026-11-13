"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  ACESFilmicToneMapping, CylinderGeometry, DirectionalLight, HemisphereLight, Mesh, MeshStandardMaterial,
  OrthographicCamera, PCFShadowMap, PlaneGeometry, Scene, ShadowMaterial, WebGLRenderer,
} from "three";
import { buildCake, createSpongeTexture, disposeMeshes } from "./cake-model";
import { storyCakeFlavors } from "./cake-recipe";

export type StoryCakePose = { separation: number; chapter: number };

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
    const { cake, layers } = buildCake({ formation: "stack", flavors: [...storyCakeFlavors].reverse() }, sponge.texture);
    scene.add(cake);

    function render() {
      if (contextLost) return;
      const { separation, chapter } = pose.current;
      const center = 1.02 + separation * .84;
      camera.position.set(2.3 - separation * 1.2, center + 2.1 - separation * 1.35, 7.2);
      camera.lookAt(0, center, 0);
      camera.zoom = 1.16 - separation * .16;
      camera.updateProjectionMatrix();

      layers.forEach((layer, index) => {
        const readingOrder = layers.length - 1 - index;
        const emphasis = Math.max(0, 1 - Math.abs(readingOrder - chapter)) * separation;
        const side = readingOrder % 2 === 0 ? .24 : -.24;
        layer.position.set(side * separation + emphasis * .22, .12 + index * (.4 + separation * .56), emphasis * .48);
        layer.rotation.z = side * separation * .22;
      });
      renderer.render(scene, camera);
    }

    function resize() {
      const { clientWidth: width, clientHeight: height } = stage;
      if (!width || !height) return;
      const aspect = width / height;
      const halfHeight = Math.max(2.22, 2.12 / aspect);
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
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
