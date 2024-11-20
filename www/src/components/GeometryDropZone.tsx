import { Color3, HighlightLayer, Mesh, StandardMaterial } from "@babylonjs/core";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Container, useAppContext } from "../context/AppContext";
import { createGeometry, geometryData } from "../engine/GeometryFactory";
import SceneTree from "./sceneTree/sceneTree";

const GeometryDropZone = () => {
  const { scene, containers, setContainers, selectedGeometries, setSelectedGeometries, meshes, setMeshes } = useAppContext();
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

  const handleDrop = (e: React.DragEvent, targetGeometryId?: number) => {
    e.preventDefault();
    const geometryType = e.dataTransfer.getData("geometryType");
    const color = e.dataTransfer.getData("color");
    const draggedGeometryId = e.dataTransfer.getData("geometryId");

    if (geometryType) {
      const typeData = geometryData.find((data) => data.name.toLowerCase() === geometryType); // Busca la geometría en geometryData

      if (typeData && scene) {
        const mesh = createGeometry(scene, typeData);
        
        mesh && setMeshes(prev => [...prev, mesh]);
    
        if (mesh) {
          const newGeometry: Container = {
            id: Number(mesh.id),
            name: mesh.name,
            isExpanded: true,
            meshId: mesh.id,
          };
          setContainers((prev) => [...prev, newGeometry]);
        }
      }
    } else if (color && targetGeometryId !== undefined) {
      applyColor(targetGeometryId, color);
    } else if (draggedGeometryId && targetGeometryId !== undefined) {
      reorganizeGeometries(parseInt(draggedGeometryId), targetGeometryId);
    }
  };
  
  const handleDragStart = (e: React.DragEvent, geometryId: number) => {
    // e.dataTransfer.setData("geometryId", geometryId.toString());
    console.log("handleDragStart", e.dataTransfer, geometryId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const applyColor = (geometryId: number, color: string) => {
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

  const handleGeometryClick = (geometryId: number, event: React.MouseEvent) => {
    if (!scene || !highlightLayer) return;

    if (event.ctrlKey || event.metaKey) {
      // Multi-selección
      setSelectedGeometries((prev) =>
        prev.includes(geometryId) ? prev.filter((id) => id !== geometryId) : [...prev, geometryId]
      );
    } else {
      // Selección única
      setSelectedGeometries([geometryId]);
    }

    updateHighlight();
  };

  const updateHighlight = () => {
    if (!scene || !highlightLayer) return;

    highlightLayer.removeAllMeshes();
    selectedGeometries.forEach((id) => {
      const mesh = scene.getMeshByName(containers.find((g) => g.id === id)?.name || "");
      if (mesh) {
        highlightLayer.addMesh(mesh as any, Color3.Yellow());
      }
    });
  };

  const reorganizeGeometries = (draggedId: number, targetId: number) => {
    console.log(draggedId, targetId);
  };

  return (
    <div onDrop={(e) => handleDrop(e)} onDragOver={handleDragOver} className="component geometry-dropzone">
      <SceneTree/>
    </div>
  );
};

export default GeometryDropZone;
