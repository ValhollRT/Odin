import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAppContext } from "../context/AppContext";
import { Button } from "./ui/Button";
import { createGeometry, geometryData, GeometryData } from "./GeometryFactory";

type GeometryType = "sphere" | "cube" | "cylinder" | "cone" | "torus";

const colors = [
  { name: "Rojo", hex: "#FF0000" },
  { name: "Verde", hex: "#00FF00" },
  { name: "Azul", hex: "#0000FF" },
  { name: "Amarillo", hex: "#FFFF00" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Cian", hex: "#00FFFF" },
];

const GeometryCreator = () => {
  const [activeTab, setActiveTab] = useState("geometries");
  const { scene, setGeometries } = useAppContext();

  const handleGeometryCreate = (type: GeometryData) => {
    if (!scene) return;

    const mesh = createGeometry(scene, type); // Usa la función createGeometry
    setGeometries((prev) => [
      ...prev,
      {
        id: Number(mesh!.id), // Convierte mesh.id a número
        type: type.name.toLowerCase(),
        meshName: mesh!.name,
        children: [],
        isExpanded: true,
      },
    ]);
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("geometryType", type);
  };

  const handleColorDragStart = (e: React.DragEvent, color: string) => {
    e.dataTransfer.setData("color", color);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="geometries">Geometrías</TabsTrigger>
        <TabsTrigger value="materials">Materiales</TabsTrigger>
      </TabsList>
      <TabsContent value="geometries" className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Crear Geometrías</h3>
        <div className="grid grid-cols-2 gap-2">
          {geometryData.map((type) => (
            <Button
              key={type.name}
              draggable
              onDragStart={(e) => {
                // e.dataTransfer.setData("geometryType", type.name.toLowerCase());
                handleDragStart(e, type.name.toLowerCase());
              }}
              onClick={() => {
                handleGeometryCreate(type);
              }}
            >
              {type.name}
            </Button>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="materials" className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Paleta de Colores</h3>
        <div className="grid grid-cols-3 gap-2">
          {colors.map((color) => (
            <Button
              key={color.hex}
              draggable
              onDragStart={(e) => {
                handleColorDragStart(e, color.hex);
              }}
              style={{ backgroundColor: color.hex, color: "#000000" }}
            >
              {color.name}
            </Button>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default GeometryCreator;
