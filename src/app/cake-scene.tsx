"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ACESFilmicToneMapping, CanvasTexture, CylinderGeometry, DirectionalLight, ExtrudeGeometry, Group,
  HemisphereLight, IcosahedronGeometry, LatheGeometry, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, RepeatWrapping, Scene,
  PCFShadowMap, ShadowMaterial, Shape, SphereGeometry, TorusGeometry, Vector2, WebGLRenderer, type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { flavors, type Flavor, type CakeRecipe } from "./cake-recipe";

function disposeMeshes(group: Group | Scene) {
  const materials = new Set<Material>();
  group.traverse(object => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    for (const material of [object.material].flat()) materials.add(material);
  });
  for (const material of materials) material.dispose();
}

function spongeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#f4efe8";
    ctx.fillRect(0, 0, 256, 256);
    let seed = 17;
    const noise = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let index = 0; index < 4600; index++) {
      const x = noise() * 256;
      const y = noise() * 256;
      const size = .22 + noise() ** 3 * 2.05;
      ctx.fillStyle = index % 5 === 0 ? "rgba(255,255,255,.75)" : `rgba(69,41,24,${.08 + noise() * .38})`;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 1.2, size, noise() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
}

function dollop(color: string, size = 1) {
  const profile = [[0, 0], [.09, .001], [.114, .024], [.101, .051], [.081, .073], [.052, .096], [.027, .118], [0, .146]];
  const geometry = new LatheGeometry(profile.map(([x, y]) => new Vector2(x, y)), 32);
  const vertices = geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i), y = vertices.getY(i), z = vertices.getZ(i);
    const ridge = 1 + .13 * Math.cos(Math.atan2(z, x) * 8 + y * 20);
    vertices.setXYZ(i, x * ridge, y, z * ridge);
  }
  geometry.computeVertexNormals();
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: .48 }));
  mesh.scale.setScalar(size);
  mesh.castShadow = true;
  return mesh;
}

function garnish(flavor: Flavor) {
  const cluster = new Group();
  const glossy = (color: string) => new MeshStandardMaterial({ color, roughness: .35 });
  if (flavor.garnish === "strawberry") {
    const geometry = new SphereGeometry(.126, 22, 16);
    const points = geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const y = points.getY(i);
      const taper = .84 + y * 2.2;
      points.setXYZ(i, points.getX(i) * taper, y * 1.34, points.getZ(i) * taper);
    }
    geometry.computeVertexNormals();
    const fruit = new Group();
    fruit.position.set(-.035, .115, 0);
    fruit.rotation.z = -.55;
    const berry = new Mesh(geometry, glossy("#bf263d"));
    berry.castShadow = true;
    fruit.add(berry);
    const seedGeometry = new SphereGeometry(.007, 6, 5);
    const seed = new MeshStandardMaterial({ color: "#f3cb81", roughness: .68 });
    for (let i = 0; i < 25; i++) {
      const y = -.13 + i * .0105;
      const turn = i * 2.39996;
      const width = Math.sqrt(Math.max(0, .126 ** 2 - (y / 1.34) ** 2)) * (.84 + y / 1.34 * 2.2);
      const pit = new Mesh(seedGeometry, seed);
      pit.position.set(Math.cos(turn) * width, y, Math.sin(turn) * width);
      pit.scale.y = 1.65;
      fruit.add(pit);
    }
    for (let i = 0; i < 4; i++) {
      const leaf = new Mesh(new SphereGeometry(.06, 9, 6), glossy("#557237"));
      leaf.scale.set(1, .14, .34);
      leaf.rotation.y = i * Math.PI / 2;
      leaf.position.set(Math.cos(leaf.rotation.y) * .039, .148, -Math.sin(leaf.rotation.y) * .039);
      fruit.add(leaf);
    }
    cluster.add(fruit);
    const frosting = dollop("#ffd8cf", .78);
    frosting.position.set(.13, 0, .06);
    cluster.add(frosting);
  } else if (flavor.garnish === "mango" || flavor.garnish === "chocolate") {
    const mango = flavor.garnish === "mango";
    const colors = mango ? ["#e79522", "#ffbd44", "#f2a027"] : ["#4f251b", "#773d29", "#582f20"];
    colors.forEach((color, index) => {
      const geometry = mango ? new RoundedBoxGeometry(.125, .111, .118, 2, .024) :
        new TorusGeometry(.078, .016, 8, 19, Math.PI * 1.37);
      const piece = new Mesh(geometry, glossy(color));
      piece.position.set((index - 1) * .105, .064 + (index % 2) * .05, (index % 2) * .08);
      piece.rotation.set(.27 * index, index * .87, .18 * index);
      piece.castShadow = true;
      cluster.add(piece);
    });
  } else {
    cluster.add(dollop(flavor.icing, 1.2));
    const colors = flavor.garnish === "matcha" ? ["#526237", "#819448", "#bec783"] :
      flavor.garnish === "ube" ? ["#694779", "#a470b2", "#dfb4e8"] : ["#c09a67", "#e2c99f", "#fff3d6"];
    for (let i = 0; i < 9; i++) {
      const angle = i * 2.39996;
      const crumb = new Mesh(new IcosahedronGeometry(.018 + (i % 3) * .004, 0), glossy(colors[i % 3]));
      crumb.position.set(Math.cos(angle) * (.12 + (i % 3) * .025), .013, Math.sin(angle) * (.11 + (i % 3) * .023));
      cluster.add(crumb);
    }
  }
  return cluster;
}

function buildCake(recipe: CakeRecipe, texture: CanvasTexture) {
  const cake = new Group();
  const plainCream = new MeshStandardMaterial({ color: "#f3e1c7", roughness: .62 });
  const radius = 1.42;
  const triangle = recipe.formation === "triangle";

  function addBand(material: MeshStandardMaterial, y: number, height: number, radius: number, sector?: { start: number; end: number; center: number }) {
    let mesh;
    if (sector) {
      const shape = new Shape();
      shape.moveTo(0, 0);
      shape.absarc(0, 0, radius, sector.start, sector.end, false);
      shape.lineTo(0, 0);
      const geometry = new ExtrudeGeometry(shape, { depth: height, curveSegments: 24, bevelEnabled: true, bevelSegments: 3, bevelSize: .019, bevelThickness: .011 });
      geometry.rotateX(-Math.PI / 2);
      mesh = new Mesh(geometry, material);
      mesh.position.set(Math.cos(sector.center) * .067, y, -Math.sin(sector.center) * .067);
    } else {
      mesh = new Mesh(new CylinderGeometry(radius, radius, height, 84), material);
      mesh.position.y = y + height / 2;
    }
    mesh.castShadow = mesh.receiveShadow = true;
    cake.add(mesh);
  }

  function placeGarnish(flavor: Flavor, y: number, angle: number, distance: number, size: number) {
    const group = garnish(flavor);
    group.position.set(Math.cos(angle) * distance, y, -Math.sin(angle) * distance);
    group.rotation.y = angle + .4;
    group.scale.setScalar(size);
    cake.add(group);
  }

  const width = Math.PI * 2 / recipe.flavors.length;
  recipe.flavors.forEach((selection, index) => {
    const flavor = flavors[selection ?? 4];
    const batter = new MeshStandardMaterial({ color: flavor.sponge, map: texture, bumpMap: texture, bumpScale: .026, roughness: .94 });
    const filling = new MeshStandardMaterial({ color: flavor.filling, roughness: .68 });
    const angle = (index + .5) * width;
    if (triangle) {
      const sector = { start: index * width + .029, end: (index + 1) * width - .029, center: angle };
      addBand(batter, .19, .198, radius, sector);
      addBand(filling, .388, .049, radius - .018, sector);
      addBand(batter, .437, .164, radius + .004, sector);
      addBand(plainCream, .601, .061, radius - .012, sector);
      addBand(batter, .662, .147, radius, sector);
      addBand(new MeshStandardMaterial({ color: flavor.icing, roughness: .43 }), .809, .07, radius + .007, sector);
      if (selection !== null) placeGarnish(flavor, .886, angle, 1.06, 1.18);
    } else {
      const base = .19 + index * .355;
      const layerRadius = radius - index * .027;
      addBand(batter, base, .135, layerRadius);
      addBand(filling, base + .135, .036, layerRadius - .008);
      addBand(batter, base + .171, .128, layerRadius);
      addBand(plainCream, base + .299, .056, layerRadius + .01);
    }
  });

  if (!triangle) {
    const top = .19 + recipe.flavors.length * .355;
    const topFlavor = recipe.flavors.at(-1);
    addBand(new MeshStandardMaterial({ color: flavors[topFlavor ?? 4].icing, roughness: .44 }), top, .055, radius - (recipe.flavors.length - 1) * .027);
    const present = [...new Set(recipe.flavors.filter(index => index !== null))];
    present.forEach((selection, index) => placeGarnish(flavors[selection], top + .058, index * 2.39996 + .3, .75, 1.38));
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8;
      const bead = dollop("#fff1d8", .63);
      bead.position.set(Math.cos(angle) * 1.20, top + .055, Math.sin(angle) * 1.20);
      cake.add(bead);
    }
  }
  return cake;
}

export function CakeScene({ recipe, angle, dragging, onAvailabilityChange }: { recipe: CakeRecipe; angle: number; dragging: boolean; onAvailabilityChange: (available: boolean) => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const display = useRef<{ turntable: Group; texture: CanvasTexture; render: () => void; rotation: { manual: number; dragging: boolean } } | null>(null);
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
    host.append(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(39, 1, .1, 35);
    camera.position.set(3.5, 3.4, 4.85);
    camera.lookAt(0, .58, 0);
    scene.add(new HemisphereLight("#fff1e7", "#ca9bac", 2.4));
    const key = new DirectionalLight("#fff3e7", 3.3);
    key.position.set(-3, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -.0004;
    key.shadow.normalBias = .022;
    key.shadow.radius = 2.8;
    scene.add(key);
    const fill = new DirectionalLight("#f7c2d4", .8);
    fill.position.set(4, 4, -5);
    scene.add(fill);

    const ground = new Mesh(new PlaneGeometry(30, 30), new ShadowMaterial({ opacity: .23 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const plate = new Mesh(new CylinderGeometry(1.79, 1.69, .16, 80), new MeshStandardMaterial({ color: "#fff1e6", roughness: .27 }));
    plate.position.y = .09;
    plate.castShadow = plate.receiveShadow = true;
    scene.add(plate);
    const trim = new Mesh(new TorusGeometry(1.738, .025, 10, 84), new MeshStandardMaterial({ color: "#d58d92", roughness: .34, metalness: .28 }));
    trim.rotation.x = -Math.PI / 2;
    trim.position.y = .164;
    scene.add(trim);

    const turntable = new Group();
    scene.add(turntable);
    const texture = spongeTexture();
    const render = () => renderer.render(scene, camera);
    const rotation = { manual: 0, dragging: false };
    display.current = { turntable, texture, render, rotation };

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let contextLost = false;
    let lastFrame = 0;
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
      camera.updateProjectionMatrix();
      render();
    });
    resize.observe(host);
    const loseContext = (event: Event) => { event.preventDefault(); contextLost = true; syncSpin(); setFallback(true); onAvailabilityChange(false); };
    renderer.domElement.addEventListener("webglcontextlost", loseContext);

    return () => {
      display.current = null;
      resize.disconnect();
      renderer.setAnimationLoop(null);
      visibility.disconnect();
      motion.removeEventListener("change", syncSpin);
      document.removeEventListener("visibilitychange", syncSpin);
      renderer.domElement.removeEventListener("webglcontextlost", loseContext);
      renderer.domElement.remove();
      disposeMeshes(scene);
      texture.dispose();
      key.shadow.dispose();
      renderer.dispose();
    };
  }, [onAvailabilityChange]);

  useEffect(() => {
    const state = display.current;
    if (!state || fallback) return;
    const cake = buildCake(recipe, state.texture);
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
