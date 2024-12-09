import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { createGeometry, geometryData, GeometryData } from "../engine/GeometryFactory";
import { Button } from "./ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import FileExplorer from "./fileExplorer/FileExplorer";

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
  const { scene, setContainers, containers } = useAppContext();

  useEffect(() => {
    console.log(containers);
  }, [containers]);

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("geometryType", type);
  };

  const handleColorDragStart = (e: React.DragEvent, color: string) => {
    e.dataTransfer.setData("color", color);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="tab-list">
        <TabsTrigger value="explorer">Geometries</TabsTrigger>
        <TabsTrigger value="geometries">Geometries</TabsTrigger>
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
      </TabsList>
      <TabsContent value="explorer">
        <FileExplorer />
      </TabsContent>
      <TabsContent value="geometries">
        <div>
          {geometryData.map((type) => (
            <Button
              key={type.name}
              draggable
              onDragStart={(e) => {
                handleDragStart(e, type.name.toLowerCase());
              }}
            >
              {type.name}
            </Button>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="materials">
        <div>
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
