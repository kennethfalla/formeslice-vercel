"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import {
  ACESFilmicToneMapping, CylinderGeometry, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial,
  PCFShadowMap, PerspectiveCamera, PlaneGeometry, Scene, ShadowMaterial, Vector2, WebGLRenderer, type Texture,
} from "three";
import { buildCake, createSpongeTexture, disposeMeshes } from "./cake-model";
import type { CakeRecipe } from "./cake-recipe";

export function CakeScene({ recipe, angle, dragging, capture, onAvailabilityChange }: {
  recipe: CakeRecipe;
  angle: number;
  dragging: boolean;
  capture: RefObject<(() => HTMLCanvasElement | null) | null>;
  onAvailabilityChange: (available: boolean) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const display = useRef<{ turntable: Group; texture: Texture; render: () => void; rotation: { manual: number; dragging: boolean } } | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setFallback(true);
      onAvailabilityChange(false);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.append(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(34, 1, .1, 35);
    camera.position.set(3.1, 3.5, 5.05);
    camera.lookAt(0, .72, 0);
    scene.add(new HemisphereLight("#fff5ec", "#b59a87", 1.56));
    const key = new DirectionalLight("#fff5eb", 2.55);
    key.position.set(-3, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -2.5;
    key.shadow.camera.right = key.shadow.camera.top = 2.5;
    key.shadow.bias = -.0004;
    key.shadow.normalBias = .022;
    key.shadow.radius = 2.8;
    scene.add(key);
    const fill = new DirectionalLight("#fff4ec", 1.25);
    fill.position.set(4, 4, -5);
    scene.add(fill);

    const ground = new Mesh(new PlaneGeometry(30, 30), new ShadowMaterial({ opacity: .15 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const plate = new Mesh(new CylinderGeometry(1.66, 1.58, .1, 96), new MeshStandardMaterial({ color: "#faf2e9", roughness: .46 }));
    plate.position.y = .055;
    plate.castShadow = plate.receiveShadow = true;
    scene.add(plate);
    const turntable = new Group();
    scene.add(turntable);
    const render = () => renderer.render(scene, camera);
    const rotation = { manual: 0, dragging: false };
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let contextLost = false;
    let lastFrame = 0;
    const sponge = createSpongeTexture(renderer, () => {
      if (contextLost) return;
      render();
      onAvailabilityChange(true);
    });
    display.current = { turntable, texture: sponge.texture, render, rotation };

    capture.current = () => {
      if (contextLost) return null;
      const snapshot = document.createElement("canvas");
      snapshot.width = 1050;
      snapshot.height = 540;
      const ctx = snapshot.getContext("2d");
      if (!ctx) return null;
      const originalSize = renderer.getSize(new Vector2());
      const originalAspect = camera.aspect;
      const originalZoom = camera.zoom;
      try {
        renderer.setSize(snapshot.width, snapshot.height, false);
        camera.aspect = snapshot.width / snapshot.height;
        camera.zoom = 1.12;
        camera.updateProjectionMatrix();
        render();
        // Read immediately while the current WebGL frame is still available.
        ctx.drawImage(renderer.domElement, 0, 0, snapshot.width, snapshot.height);
        return snapshot;
      } finally {
        renderer.setSize(originalSize.x, originalSize.y, false);
        camera.aspect = originalAspect;
        camera.zoom = originalZoom;
        camera.updateProjectionMatrix();
        render();
      }
    };
    const spin = (time: number) => {
      if (!lastFrame) lastFrame = time;
      const elapsed = time - lastFrame;
      if (elapsed < 32) return;
      lastFrame = time;
      if (rotation.dragging) return;
      turntable.rotation.y += Math.min(elapsed, 80) * .00021;
      render();
    };
    function syncSpin() {
      lastFrame = 0;
      renderer.setAnimationLoop(visible && !document.hidden && !motion.matches && !contextLost ? spin : null);
    }
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncSpin();
    });
    visibility.observe(host);
    motion.addEventListener("change", syncSpin);
    document.addEventListener("visibilitychange", syncSpin);

    const resize = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = host;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.zoom = Math.min(1.06, camera.aspect * 1.12);
      camera.updateProjectionMatrix();
      render();
    });
    resize.observe(host);
    const loseContext = (event: Event) => { event.preventDefault(); contextLost = true; syncSpin(); setFallback(true); onAvailabilityChange(false); };
    renderer.domElement.addEventListener("webglcontextlost", loseContext);

    return () => {
      display.current = null;
      capture.current = null;
      resize.disconnect();
      renderer.setAnimationLoop(null);
      visibility.disconnect();
      motion.removeEventListener("change", syncSpin);
      document.removeEventListener("visibilitychange", syncSpin);
      renderer.domElement.removeEventListener("webglcontextlost", loseContext);
      renderer.domElement.remove();
      disposeMeshes(scene);
      sponge.dispose();
      key.shadow.dispose();
      renderer.dispose();
    };
  }, [capture, onAvailabilityChange]);

  useEffect(() => {
    const state = display.current;
    if (!state || fallback) return;
    const { cake } = buildCake(recipe, state.texture);
    state.turntable.add(cake);
    state.render();
    return () => { state.turntable.remove(cake); disposeMeshes(cake); };
  }, [recipe, fallback]);

  useEffect(() => {
    const state = display.current;
    if (!state || fallback) return;
    state.turntable.rotation.y += angle - state.rotation.manual;
    state.rotation.manual = angle;
    state.rotation.dragging = dragging;
    state.render();
  }, [angle, dragging, fallback]);

  return <>
    <div className="cake-scene" ref={mount} aria-hidden="true" />
    {fallback && <div className="cake-scene-fallback">
      <Image src={recipe.formation === "stack" ? "/images/details/products/cutouts/layer-2.webp" : "/images/details/products/cutouts/triangle-5.webp"}
        width={343} height={345} alt="Example cake" />
      <p>This device is showing a sample photo. Your choices appear in the recipe below.</p>
    </div>}
  </>;
}
