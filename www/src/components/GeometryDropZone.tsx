import { useEffect, useState } from "react";
import { StandardMaterial, Color3, HighlightLayer } from "@babylonjs/core";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useAppContext, Geometry } from "../context/AppContext";
import { createGeometry, geometryData } from "./GeometryFactory";

const GeometryDropZone = () => {
  const {
    scene,
    geometries,
    setGeometries,
    selectedGeometries,
    setSelectedGeometries,
  } = useAppContext();
  const [highlightLayer, setHighlightLayer] = useState<HighlightLayer | null>(
    null
  );

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
      const typeData = geometryData.find(
        (data) => data.name.toLowerCase() === geometryType
      ); // Busca la geometría en geometryData

      if (typeData && scene) {
        const mesh = createGeometry(scene, typeData); // Utiliza createGeometry
        if (mesh) {
          const newGeometry: Geometry = {
            id: Number(mesh.id),
            type: typeData.name.toLowerCase(),
            meshName: mesh.name,
            parentId: targetGeometryId, // Asigna parentId si se proporciona
            children: [],
            isExpanded: true,
          };
          setGeometries((prev) => [...prev, newGeometry]);
        }
      }
    } else if (color && targetGeometryId !== undefined) {
      applyColor(targetGeometryId, color);
    } else if (draggedGeometryId && targetGeometryId !== undefined) {
      reorganizeGeometries(parseInt(draggedGeometryId), targetGeometryId);
    }
  };
  const handleDragStart = (e: React.DragEvent, geometryId: number) => {
    e.dataTransfer.setData("geometryId", geometryId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const applyColor = (geometryId: number, color: string) => {
    if (!scene) return;

    setGeometries((prev) =>
      prev.map((g) => {
        if (g.id === geometryId) {
          const mesh = scene.getMeshByName(g.meshName);
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
        prev.includes(geometryId)
          ? prev.filter((id) => id !== geometryId)
          : [...prev, geometryId]
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
      const mesh = scene.getMeshByName(
        geometries.find((g) => g.id === id)?.meshName || ""
      );
      if (mesh) {
        highlightLayer.addMesh(mesh as any, Color3.Yellow());
      }
    });
  };

  const reorganizeGeometries = (draggedId: number, targetId: number) => {
    setGeometries((prev) => {
      const newGeometries = [...prev];
      const draggedIndex = newGeometries.findIndex((g) => g.id === draggedId);
      const targetIndex = newGeometries.findIndex((g) => g.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedGeometry] = newGeometries.splice(draggedIndex, 1);
        draggedGeometry.parentId = targetId;
        newGeometries[targetIndex].children.push(draggedId);
        newGeometries.splice(targetIndex + 1, 0, draggedGeometry);
      }

      return newGeometries;
    });

    if (scene) {
      const draggedMesh = scene.getMeshByName(
        geometries.find((g) => g.id === draggedId)?.meshName || ""
      );
      const targetMesh = scene.getMeshByName(
        geometries.find((g) => g.id === targetId)?.meshName || ""
      );
      if (draggedMesh && targetMesh) {
        draggedMesh.parent = targetMesh;
      }
    }
  };

  const toggleExpand = (geometryId: number) => {
    setGeometries((prev) =>
      prev.map((g) =>
        g.id === geometryId ? { ...g, isExpanded: !g.isExpanded } : g
      )
    );
  };

  const renderGeometryItem = (geometry: Geometry, level: number = 0) => {
    const hasChildren = geometry.children.length > 0;
    const childGeometries = geometries.filter(
      (g) => g.parentId === geometry.id
    );

    return (
      <div key={geometry.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`geometry-item mb-2 p-2 rounded cursor-pointer transition-colors duration-200 
            ${selectedGeometries.includes(geometry.id) ? "selected" : ""}
          `}
          draggable
          onDragStart={(e) => handleDragStart(e, geometry.id)}
          onDrop={(e) => handleDrop(e, geometry.id)}
          onDragOver={handleDragOver}
          onClick={(e) => handleGeometryClick(geometry.id, e)}
        >
          <div className="geometry-item-content">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(geometry.id)}
                className="geometry-item-toggle"
              >
                {geometry.isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}
            <h3>{geometry.type}</h3>
          </div>
          {geometry.color && <p>Color: {geometry.color}</p>}
        </div>
        {hasChildren &&
          geometry.isExpanded &&
          childGeometries.map((child) => renderGeometryItem(child, level + 1))}
      </div>
    );
  };

  return (
    <div
      onDrop={(e) => handleDrop(e)}
      onDragOver={handleDragOver}
      className="component geometry-dropzone"
    >
      <h2>Geometrías Creadas</h2>
      {geometries
        .filter((g) => !g.parentId)
        .map((geometry) => renderGeometryItem(geometry))}
    </div>
  );
}

export default GeometryDropZone;