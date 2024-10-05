'use client';

import { useEffect, useState } from 'react';
import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  HighlightLayer
} from 'babylonjs';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useAppContext, Geometry } from '../context/AppContext';

const GeometryDropZone = () => {
  const {
    scene,
    geometries,
    setGeometries,
    selectedGeometries,
    setSelectedGeometries
  } = useAppContext();
  const [highlightLayer, setHighlightLayer] = useState<HighlightLayer | null>(
    null
  );

  useEffect(() => {
    if (scene) {
      const newHighlightLayer = new HighlightLayer('highlightLayer', scene);
      setHighlightLayer(newHighlightLayer);

      return () => {
        newHighlightLayer.dispose();
      };
    }
  }, [scene]);

  const handleDrop = (e: React.DragEvent, targetGeometryId?: number) => {
    e.preventDefault();
    const geometryType = e.dataTransfer.getData('geometryType');
    const color = e.dataTransfer.getData('color');
    const draggedGeometryId = e.dataTransfer.getData('geometryId');

    if (geometryType) {
      const newGeometry = createGeometry(geometryType, targetGeometryId);
      if (newGeometry) {
        setGeometries(prev => [...prev, newGeometry]);
      }
    } else if (color && targetGeometryId !== undefined) {
      applyColor(targetGeometryId, color);
    } else if (draggedGeometryId && targetGeometryId !== undefined) {
      reorganizeGeometries(parseInt(draggedGeometryId), targetGeometryId);
    }
  };

  const handleDragStart = (e: React.DragEvent, geometryId: number) => {
    e.dataTransfer.setData('geometryId', geometryId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const createGeometry = (type: string, parentId?: number): Geometry | null => {
    if (!scene) return null;

    const id = Date.now();
    const meshName = `${type}-${id}`;
    let mesh;

    switch (type) {
      case 'sphere':
        mesh = MeshBuilder.CreateSphere(meshName, { diameter: 5 }, scene);
        break;
      case 'cube':
        mesh = MeshBuilder.CreateBox(meshName, { size: 5 }, scene);
        break;
      case 'cylinder':
        mesh = MeshBuilder.CreateCylinder(
          meshName,
          { height: 5, diameter: 5 },
          scene
        );
        break;
      case 'cone':
        mesh = MeshBuilder.CreateCylinder(
          meshName,
          { height: 5, diameterTop: 0, diameterBottom: 5 },
          scene
        );
        break;
      case 'torus':
        mesh = MeshBuilder.CreateTorus(
          meshName,
          { thickness: 1, diameter: 5 },
          scene
        );
        break;
      default:
        return null;
    }

    if (parentId) {
      const parentMesh = scene.getMeshByName(
        geometries.find(g => g.id === parentId)?.meshName || ''
      );
      if (parentMesh) {
        mesh.parent = parentMesh;
      }
    } else {
      mesh.position.x = (Math.random() - 0.5) * 20;
      mesh.position.z = (Math.random() - 0.5) * 20;
      mesh.position.y = 2.5;
    }

    return { id, type, meshName, children: [], isExpanded: true, parentId };
  };

  const applyColor = (geometryId: number, color: string) => {
    if (!scene) return;

    setGeometries(prev =>
      prev.map(g => {
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
      setSelectedGeometries(prev =>
        prev.includes(geometryId)
          ? prev.filter(id => id !== geometryId)
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
    selectedGeometries.forEach(id => {
      const mesh = scene.getMeshByName(
        geometries.find(g => g.id === id)?.meshName || ''
      );
      if (mesh) {
        highlightLayer.addMesh(mesh as any, Color3.Yellow());
      }
    });
  };

  const reorganizeGeometries = (draggedId: number, targetId: number) => {
    setGeometries(prev => {
      const newGeometries = [...prev];
      const draggedIndex = newGeometries.findIndex(g => g.id === draggedId);
      const targetIndex = newGeometries.findIndex(g => g.id === targetId);

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
        geometries.find(g => g.id === draggedId)?.meshName || ''
      );
      const targetMesh = scene.getMeshByName(
        geometries.find(g => g.id === targetId)?.meshName || ''
      );
      if (draggedMesh && targetMesh) {
        draggedMesh.parent = targetMesh;
      }
    }
  };

  const toggleExpand = (geometryId: number) => {
    setGeometries(prev =>
      prev.map(g =>
        g.id === geometryId ? { ...g, isExpanded: !g.isExpanded } : g
      )
    );
  };

  const renderGeometryItem = (geometry: Geometry, level: number = 0) => {
    const hasChildren = geometry.children.length > 0;
    const childGeometries = geometries.filter(g => g.parentId === geometry.id);

    return (
      <div key={geometry.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`mb-2 p-2 rounded cursor-pointer transition-colors duration-200 ${
            selectedGeometries.includes(geometry.id)
              ? 'bg-yellow-200'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          draggable
          onDragStart={e => handleDragStart(e, geometry.id)}
          onDrop={e => handleDrop(e, geometry.id)}
          onDragOver={handleDragOver}
          onClick={e => handleGeometryClick(geometry.id, e)}
        >
          <div className="flex items-center">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(geometry.id)}
                className="mr-2"
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
          childGeometries.map(child => renderGeometryItem(child, level + 1))}
      </div>
    );
  };

  return (
    <div
      onDrop={e => handleDrop(e)}
      onDragOver={handleDragOver}
      className="bg-white rounded-lg shadow-md p-4 h-full overflow-auto"
    >
      <h2 className="text-xl font-bold mb-4">Geometrías Creadas</h2>
      {geometries
        .filter(g => !g.parentId)
        .map(geometry => renderGeometryItem(geometry))}
    </div>
  );
}

export default GeometryDropZone;