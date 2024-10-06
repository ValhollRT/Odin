import { MeshBuilder, Scene, Mesh, DynamicTexture, StandardMaterial } from "@babylonjs/core";

// Interfaz para describir los datos de la geometría
export interface GeometryData {
  name: string;
  method:
    | "CreateBox"
    | "CreateTiledBox"
    | "CreateSphere"
    | "CreateDisc"
    | "CreateIcoSphere"
    | "CreateRibbon"
    | "CreateCylinder"
    | "CreateTorus"
    | "CreateTorusKnot"
    | "CreateLineSystem"
    | "CreateLines"
    | "CreateDashedLines"
    | "ExtrudeShape"
    | "ExtrudeShapeCustom"
    | "CreateLathe"
    | "CreateTiledPlane"
    | "CreatePlane"
    | "CreateGround"
    | "CreateTiledGround"
    | "CreateGroundFromHeightMap"
    | "CreatePolygon"
    | "ExtrudePolygon"
    | "CreateTube"
    | "CreatePolyhedron"
    | "CreateGeodesic"
    | "CreateGoldberg"
    | "CreateDecal"
    | "CreateCapsule"
    | "CreateText";
  options?: any;
}

// Definición de los datos de la geometría
const geometryData: GeometryData[] = [
    { name: "Esfera", method: "CreateSphere", options: { diameter: 5 } },
    { name: "Cubo", method: "CreateBox", options: { size: 5 } },
    { name: "Cilindro", method: "CreateCylinder", options: { height: 5, diameter: 5 } },
    { name: "Cono", method: "CreateCylinder", options: { height: 5, diameterTop: 0, diameterBottom: 5 } },
    { name: "Toro", method: "CreateTorus", options: { thickness: 1, diameter: 5 } },
    { name: "Texto", method: "CreateText", options: { text: "Hola", size: 5, resolution: 32 } },
    { name: "Caja Enlosada", method: "CreateTiledBox", options: { size: 5, tileSize: 1 } },
    { name: "Disco", method: "CreateDisc", options: { radius: 5, tessellation: 64 } },
    { name: "IcoEsfera", method: "CreateIcoSphere", options: { radius: 5, subdivisions: 4 } },
    { name: "Cinta", method: "CreateRibbon", options: { pathArray: [], closeArray: true, closePath: true } },
    { name: "Toroide Anudado", method: "CreateTorusKnot", options: { radius: 3, tube: 1, radialSegments: 32, tubularSegments: 32 } },
    { name: "Sistema de Líneas", method: "CreateLineSystem", options: { lines: [] } },
    { name: "Líneas", method: "CreateLines", options: { points: [] } },
    { name: "Líneas Punteadas", method: "CreateDashedLines", options: { points: [], dashSize: 3, gapSize: 1 } },
    { name: "Extruir Forma", method: "ExtrudeShape", options: { shape: [], path: [] } },
    { name: "Extruir Forma Personalizada", method: "ExtrudeShapeCustom", options: { shape: [], path: [] } },
    { name: "Lathe", method: "CreateLathe", options: { shape: [], radius: 5 } },
    { name: "Plano Enlosado", method: "CreateTiledPlane", options: { size: 5, tileSize: 1 } },
    { name: "Plano", method: "CreatePlane", options: { size: 5 } },
    { name: "Suelo", method: "CreateGround", options: { width: 10, height: 10 } },
    { name: "Suelo Enlosado", method: "CreateTiledGround", options: { xmin: -5, zmin: -5, xmax: 5, zmax: 5 } },
    { name: "Suelo desde Mapa de Altura", method: "CreateGroundFromHeightMap", options: { url: "", width: 10, height: 10, subdivisions: 10, minHeight: 0, maxHeight: 10 } },
    { name: "Polígono", method: "CreatePolygon", options: { shape: [] } },
    { name: "Extruir Polígono", method: "ExtrudePolygon", options: { shape: [] } },
    { name: "Tubo", method: "CreateTube", options: { path: [], radius: 1 } },
    { name: "Poliedro", method: "CreatePolyhedron", options: { type: 0, size: 5 } },
    { name: "Geodésico", method: "CreateGeodesic", options: { radius: 5, subdivisions: 4 } },
    { name: "Goldberg", method: "CreateGoldberg", options: { size: 5, frequency: 3 } },
    { name: "Decal", method: "CreateDecal", options: { position: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 1, z: 0 }, size: { x: 1, y: 1, z: 1 } } },
    { name: "Cápsula", method: "CreateCapsule", options: { height: 5, radius: 2 } }
  ];

// Función para crear la geometría
const createGeometry = (scene: Scene, type: GeometryData): Mesh | null => {
  const id = Date.now();
  // const meshName = `${type.name.toLowerCase()}-${id}`;
  const meshName = `${id}`;
  // Manejar la creación de texto usando DynamicTexture
  if (type.method === "CreateText") {
    const { text, size } = type.options;

    if (!text) {
      console.error(`Error: Falta el parámetro de texto para ${type.name}`);
      return null;
    }

    // Crear una textura dinámica para el texto
    const dynamicTexture = new DynamicTexture(`${meshName}-texture`, 512, scene, true);
    dynamicTexture.drawText(text, null, null, "bold 44px Arial", "white", "transparent", true);

    // Crear un material con la textura dinámica
    const textMaterial = new StandardMaterial(`${meshName}-material`, scene);
    textMaterial.diffuseTexture = dynamicTexture;

    // Crear un plano para mostrar el texto
    const textPlane = MeshBuilder.CreatePlane(meshName, { size: size || 5 }, scene);
    textPlane.material = textMaterial;
    textPlane.position.y = 2.5;

    return textPlane;
  }

  // Crear geometrías estándar usando MeshBuilder
  const mesh = MeshBuilder[type.method](meshName, type.options, scene);

  if (mesh) {
    mesh.position.x = (Math.random() - 0.5) * 20;
    mesh.position.z = (Math.random() - 0.5) * 20;
    mesh.position.y = 2.5;
    return mesh;
  } else {
    console.error(`Error al crear la geometría ${type.name}`);
    return null;
  }
};

export { geometryData, createGeometry };
