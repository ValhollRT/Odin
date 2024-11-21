import { Color3, HighlightLayer, StandardMaterial } from "@babylonjs/core";
import { useEffect, useState } from "react";
import { Container, useAppContext } from "../context/AppContext";
import { createGeometry, geometryData } from "../engine/GeometryFactory";
import { SceneTree } from "./sceneTree/sceneTree";

const GeometryDropZone = () => {
  const { scene, setContainers, setMeshes } = useAppContext();
  const [highlightLayer, setHighlightLayer] = useState<HighlightLayer | null>(null);

  useEffect(() => {
    if (scene) {
      const newHighlightLayer = new HighlightLayer("highlightLayer", scene);
      setHighlightLayer(newHighlightLayer);

      return () => {
        newHighlightLayer.dispose();
      };
    }
  }, [scene]);

  const handleDrop = (e: React.DragEvent, targetGeometryId?: string) => {
    e.preventDefault();
    const geometryType = e.dataTransfer.getData("geometryType");
    const color = e.dataTransfer.getData("color");
    const draggedGeometryId = e.dataTransfer.getData("geometryId");

    if (geometryType) {
      const typeData = geometryData.find((data) => data.name.toLowerCase() === geometryType); // Busca la geometría en geometryData

      if (typeData && scene) {
        const mesh = createGeometry(scene, typeData);

        mesh && setMeshes((prev) => [...prev, mesh]);

        if (mesh) {
          const newContainer: Container = {
            id: mesh.id,
            name: mesh.name,
            isExpanded: false,
            meshId: mesh.id,
            icons: [],
            visible: true,
            locked: true,
            children: [],
          };

          console.log(newContainer);

          setContainers((prev) => [...prev, newContainer]);
        }
      }
    } else if (color && targetGeometryId !== undefined) {
      applyColor(targetGeometryId, color);
    } else if (draggedGeometryId && targetGeometryId !== undefined) {
      reorganizeGeometries(draggedGeometryId, targetGeometryId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const applyColor = (geometryId: string, color: string) => {
    if (!scene) return;

    setContainers((prev) =>
      prev.map((g) => {
        if (g.id === geometryId) {
          const mesh = scene.getMeshByName(g.name);
          if (mesh) {
            const material = new StandardMaterial(`material-${g.id}`, scene);
            material.diffuseColor = Color3.FromHexString(color);
            mesh.material = material;
          }
          return { ...g, color };
        }
        return g;
      })
    );
  };

  const reorganizeGeometries = (draggedId: string, targetId: string) => {
    console.log(draggedId, targetId);
  };

  return (
    <div onDrop={(e) => handleDrop(e)} onDragOver={handleDragOver} className="component">
      <SceneTree />
    </div>
  );
};

export default GeometryDropZone;
