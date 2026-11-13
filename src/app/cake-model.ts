import {
  CanvasTexture, ExtrudeGeometry, Group, IcosahedronGeometry, LatheGeometry, Mesh, MeshStandardMaterial,
  RepeatWrapping, Scene, Shape, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector2,
  type Material, type Texture, type WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { flavors, type Flavor, type CakeRecipe } from "./cake-recipe";

export function createSpongeTexture(renderer: WebGLRenderer, onReady: () => void) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 208;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#dfdfdf";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.wrapS = texture.wrapT = RepeatWrapping;

  const crumb = new Image();
  crumb.onload = () => {
    context?.drawImage(crumb, 0, 0, canvas.width, canvas.height);
    texture.needsUpdate = true;
    onReady();
  };
  crumb.onerror = onReady;
  crumb.src = "/images/details/products/sponge-crumb.webp";

  return { texture, dispose: () => {
    crumb.onload = crumb.onerror = null;
    texture.dispose();
  } };
}

export function disposeMeshes(group: Group | Scene) {
  const materials = new Set<Material>();
  group.traverse(object => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    for (const material of [object.material].flat()) materials.add(material);
  });
  for (const material of materials) material.dispose();
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

export function buildCake(recipe: CakeRecipe, texture: Texture) {
  const cake = new Group();
  const plainCream = new MeshStandardMaterial({ color: "#f5e7d3", roughness: .62 });
  const radius = 1.42;
  const layers: Group[] = [];
  const triangle = recipe.formation === "triangle";

  function addBand(parent: Group, material: MeshStandardMaterial, y: number, height: number, radius: number, sector?: { start: number; end: number; center: number }) {
    let mesh;
    if (sector) {
      const shape = new Shape();
      shape.moveTo(0, 0);
      shape.absarc(0, 0, radius, sector.start, sector.end, false);
      shape.lineTo(0, 0);
      const geometry = new ExtrudeGeometry(shape, { depth: height, curveSegments: 24, bevelEnabled: true, bevelSegments: 3, bevelSize: .014, bevelThickness: .009 });
      const uv = geometry.attributes.uv;
      for (let index = 0; index < uv.count; index++) uv.setXY(index, uv.getX(index) * 1.7, uv.getY(index) * 3.8);
      geometry.rotateX(-Math.PI / 2);
      mesh = new Mesh(geometry, material);
      mesh.position.set(Math.cos(sector.center) * .091, y, -Math.sin(sector.center) * .091);
    } else {
      const edge = Math.min(.036, height * .32);
      const profile = [
        [0, 0], [radius - edge, 0], [radius - edge * .3, edge * .4],
        [radius, edge], [radius + .007, height * .54],
        [radius - edge * .15, height - edge], [radius - edge * .45, height - edge * .28],
        [radius - edge, height], [0, height],
      ];
      const geometry = new LatheGeometry(profile.map(([r, h]) => new Vector2(r, h)), 112);
      const points = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      for (let index = 0; index < points.count; index++) {
        const x = points.getX(index);
        const z = points.getZ(index);
        const h = points.getY(index);
        const angle = Math.atan2(z, x);
        const ripple = 1 + .006 * Math.sin(angle * 17 + y * 6) + .005 * Math.cos(angle * 9 - h * 9);
        points.setXYZ(index, x * ripple, h, z * ripple);
        uv.setXY(index, uv.getX(index) * 14, h * 4.2 + y);
      }
      geometry.computeVertexNormals();
      mesh = new Mesh(geometry, material);
      mesh.position.y = y;
    }
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
  }

  function placeGarnish(parent: Group, flavor: Flavor, y: number, angle: number, distance: number, size: number) {
    const group = garnish(flavor);
    group.position.set(Math.cos(angle) * distance, y, -Math.sin(angle) * distance);
    group.rotation.y = angle + .4;
    group.scale.setScalar(size);
    parent.add(group);
  }

  const width = Math.PI * 2 / recipe.flavors.length;
  recipe.flavors.forEach((selection, index) => {
    const flavor = flavors[selection ?? 4];
    const batter = new MeshStandardMaterial({ color: flavor.sponge, map: texture, bumpMap: texture, bumpScale: .009, roughness: .97 });
    const filling = new MeshStandardMaterial({ color: flavor.filling, roughness: .42 });
    const angle = (index + .5) * width;
    if (triangle) {
      const sector = { start: index * width + .023, end: (index + 1) * width - .023, center: angle };
      addBand(cake, batter, .12, .213, radius, sector);
      addBand(cake, filling, .333, .045, radius - .015, sector);
      addBand(cake, batter, .378, .198, radius + .004, sector);
      addBand(cake, plainCream, .576, .04, radius - .011, sector);
      addBand(cake, batter, .616, .147, radius, sector);
      addBand(cake, new MeshStandardMaterial({ color: flavor.icing, roughness: .47 }), .763, .061, radius + .006, sector);
      if (selection !== null) {
        placeGarnish(cake, flavor, .833, angle, 1.02, 1.38);
        placeGarnish(cake, flavor, .833, angle + .09, .74, .65);
      }
    } else {
      const layer = new Group();
      layer.position.y = .12 + index * .4;
      cake.add(layer);
      layers.push(layer);
      const layerRadius = radius - index * .027;
      addBand(layer, batter, 0, .326, layerRadius);
      if (index < recipe.flavors.length - 1) {
        addBand(layer, plainCream, .326, .054, layerRadius + .014);
        addBand(layer, filling, .373, .027, layerRadius - .004);
        for (let dripIndex = 0; dripIndex < 5; dripIndex++) {
          const turn = index * 1.8 + dripIndex * 1.29;
          const drip = new Mesh(new SphereGeometry(1, 12, 8), filling);
          drip.position.set(Math.cos(turn) * layerRadius, .355, Math.sin(turn) * layerRadius);
          drip.scale.set(.092, .053 + .014 * (dripIndex % 3), .03);
          drip.rotation.y = Math.PI / 2 - turn;
          drip.castShadow = true;
          layer.add(drip);
        }
      }
    }
  });

  if (!triangle) {
    const layer = layers[layers.length - 1];
    const top = .326;
    const topFlavor = recipe.flavors.at(-1);
    const frostingRadius = radius - (recipe.flavors.length - 1) * .027;
    const frosting = new MeshStandardMaterial({ color: flavors[topFlavor ?? 4].icing, roughness: .48 });
    addBand(layer, frosting, top, .08, frostingRadius + .015);
    for (let ring = 1; ring <= 5; ring++) {
      const swirl = new Mesh(new TorusGeometry(frostingRadius * ring / 5.5, .021, 8, 80), frosting);
      swirl.rotation.x = -Math.PI / 2;
      swirl.position.set(.012 * ring, top + .071, -.008 * ring);
      swirl.receiveShadow = true;
      layer.add(swirl);
    }
    const present = [...new Set(recipe.flavors.filter(index => index !== null))];
    present.forEach((selection, index) => {
      const angle = index * 2.06 + .45;
      placeGarnish(layer, flavors[selection], top + .081, angle, .86, 1.65);
      placeGarnish(layer, flavors[selection], top + .081, angle + .38, .67, .92);
    });
  }
  return { cake, layers };
}

