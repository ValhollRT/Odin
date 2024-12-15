import React, { useState, useCallback } from "react";
import { Container, IconType, useAppContext } from "../../context/AppContext";
import "./scene-tree-styles.css";
import { createGeometry, geometryData } from "../../engine/GeometryFactory";
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock, Folder, Box, Type, Image, Video, Music } from "lucide-react";

// Interfaz para los nodos del árbol
interface TreeNode {
  id: string;
  name: string;
  type?: IconType; // Tipo de icono, si aplica
  children: TreeNode[];
  visible?: boolean;
  locked?: boolean;
  icons?: IconType[];
  // ... otras propiedades que necesites ...
}

export const SceneTree: React.FC = () => {
  const { scene, containers, setContainers, setMeshes } = useAppContext();
  const [treeData, setTreeData] = useState<TreeNode[]>(containers);
  const [draggingNode, setDraggingNode] = useState<TreeNode | null>(null);
  const [targetNode, setTargetNode] = useState<TreeNode | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "inside" | "after" | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<{ id: string; type: IconType } | null>(null);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);

  // Función recursiva para renderizar los nodos del árbol
  const renderNode = (node: TreeNode, level: number) => {
    const isDraggingOver = targetNode?.id === node.id;
    const isExpanded = node.children.length > 0 && containers.find((c) => c.id === node.id)?.isExpanded;

    return (
      <div
        key={node.id}
        className={`scene-tree-item ${isDraggingOver ? "scene-tree-item-over" : ""}`}
        draggable
        onDragStart={(e) => handleDragStart(e, node)}
        onDragOver={(e) => handleDragOver(e, node)}
        onDrop={(e) => handleDrop(e, node)}
      >
        <div
          className={`scene-tree-item-content ${selectedContainers.includes(node.id) ? "selected-icon" : ""}`}
          onClick={(e) => handleContainerClick(e, node)}
          onDoubleClick={(e) => handleDoubleClick(e, node)}
        >
          {node.children.length > 0 && (
            <button className="expand-button" onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <div style={{ display: "flex", flexDirection: "column", marginRight: "0.5rem" }}>
            <div
              className="visibility-icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(node.id);
              }}
            >
              {node.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </div>
            <div
              className="lock-icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(node.id);
              }}
            >
              {node.locked ? <Lock size={16} /> : <Unlock size={16} />}
            </div>
          </div>
          {node.icons?.map((iconType, index) => (
            <div
              key={index}
              className={`object-icon ${selectedIcon && selectedIcon.id === node.id && selectedIcon.type === iconType ? "selected-icon" : ""
                }`}
              draggable
              onDragStart={(e) => handleDragStart(e, node, iconType)}
              onClick={() => handleIconClick(node.id, iconType)}
            >
              {getTypeIcon(iconType)}
            </div>
          ))}
          <span>{node.name}</span>
        </div>
        {isExpanded && (
          <div className="scene-tree-item-children">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleDragStart = useCallback((e: React.DragEvent, node: TreeNode, iconType?: IconType) => {
    setDraggingNode(node);
    e.dataTransfer.setData("nodeId", node.id);
    if (iconType) {
      e.dataTransfer.setData("iconType", iconType);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, node: TreeNode) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    let position: "before" | "inside" | "after" = "inside";
    if (y < height * 0.25) position = "before";
    else if (y > height * 0.75) position = "after";
    setTargetNode(node);
    setDropPosition(position);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, node: TreeNode) => {
    e.preventDefault();
    const draggedNodeId = e.dataTransfer.getData("nodeId");
    const iconType = e.dataTransfer.getData("iconType") as IconType;

    if (draggedNodeId) {
      setTreeData((prevTree) => {
        // 1. Encontrar y eliminar el nodo arrastrado (si es necesario)
        let updatedTree = prevTree;
        let draggedNode: TreeNode | null = null;
        if (iconType) {
          // Arrastrando un icono: no necesitamos eliminar el nodo
          draggedNode = findNode(prevTree, draggedNodeId);
        } else {
          // Arrastrando un nodo: necesitamos eliminar el nodo
          [draggedNode, updatedTree] = findAndRemoveNode(prevTree, draggedNodeId);
        }
        if (!draggedNode) return prevTree; // Nodo no encontrado

        // 2. Insertar el nodo/icono en la nueva posición
        if (iconType) {
          // Insertar icono
          return updateNodeIcons(updatedTree, node.id, [...node.icons!, iconType]);
        } else {
          // Insertar nodo
          return insertNode(updatedTree, draggedNode, node.id, dropPosition || "inside");
        }
      });
    }

    setDraggingNode(null);
    setTargetNode(null);
    setDropPosition(null);
  }, []);

  const handleMainDrop = (e: React.DragEvent) => {
    const geometryType = e.dataTransfer.getData("geometryType") as IconType;

    if (geometryType) {
      const typeData = geometryData.find((data) => data.name.toLowerCase() === geometryType);

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
          setContainers((prev) => [...prev, newContainer]);
          setTreeData((prevTree) => [...prevTree, newContainer]);
        }
      }
    }
  };

  const handleMainDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleExpand = useCallback((id: string) => {
    setContainers((prev) => {
      return prev.map((container) =>
        container.id === id ? { ...container, isExpanded: !container.isExpanded } : container
      );
    });
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setTreeData((prev) => updateNodeProperty(prev, id, "visible", (value: boolean) => !value));
  }, []);

  const toggleLock = useCallback((id: string) => {
    setTreeData((prev) => updateNodeProperty(prev, id, "locked", (value: boolean) => !value));
  }, []);

  const handleIconClick = useCallback((id: string, iconType: IconType) => {
    setSelectedIcon((prev) => (prev && prev.id === id && prev.type === iconType ? null : { id, type: iconType }));
  }, []);

  const handleContainerClick = (e: React.MouseEvent, node: TreeNode) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedContainers((prev) => {
        const newSelection = prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id];
        return newSelection;
      });
    } else {
      setSelectedContainers([node.id]);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent, node: TreeNode) => {
    e.stopPropagation();
    // ... lógica para editar el nombre del nodo ...
  };

  const getTypeIcon = (type: IconType) => {
    switch (type) {
      case "group":
        return <Folder />;
      case "geometry":
        return <Box />;
      case "text":
        return <Type />;
      case "image":
        return <Image />;
      case "video":
        return <Video />;
      case "audio":
        return <Music />;
      default:
        return null;
    }
  };

  return (
    <div className="scene-tree">
      <div className="scene-tree-header">
        <input className="header-input" placeholder="Search..." />
      </div>
      <div className="scene-tree-content" onDrop={handleMainDrop} onDragOver={handleMainDragOver}>
        {treeData.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
};

// Funciones auxiliares para manipular el árbol
const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children.length > 0) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findAndRemoveNode = (nodes: TreeNode[], id: string): [TreeNode | null, TreeNode[]] => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      const [removedNode] = nodes.splice(i, 1);
      return [removedNode, nodes];
    }
    if (nodes[i].children.length > 0) {
      const [found, updatedChildren] = findAndRemoveNode(nodes[i].children, id);
      if (found) {
        nodes[i].children = updatedChildren;
        return [found, nodes];
      }
    }
  }
  return [null, nodes];
};

const insertNode = (
  nodes: TreeNode[],
  node: TreeNode,
  targetId: string,
  position: "before" | "inside" | "after"
): TreeNode[] => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      if (position === "before") {
        nodes.splice(i, 0, node);
      } else if (position === "after") {
        nodes.splice(i + 1, 0, node);
      } else if (position === "inside") {
        nodes[i].children.push(node);
      }
      return nodes;
    }
    if (nodes[i].children.length > 0) {
      const updatedChildren = insertNode(nodes[i].children, node, targetId, position);
      if (updatedChildren !== nodes[i].children) {
        nodes[i].children = updatedChildren;
        return nodes;
      }
    }
  }
  return nodes;
};

const updateNodeIcons = (nodes: TreeNode[], id: string, newIcons: IconType[]): TreeNode[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, icons: newIcons };
    }
    if (node.children.length > 0) {
      return { ...node, children: updateNodeIcons(node.children, id, newIcons) };
    }
    return node;
  });
};

const updateNodeProperty = <T extends keyof TreeNode, K extends TreeNode[T]>(
  nodes: TreeNode[],
  id: string,
  property: T,
  value: K | ((oldValue: K) => K)
): TreeNode[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      const oldValue = node[property] as K;
      const newValue = typeof value === "function" ? value(oldValue) : value;
      return { ...node, [property]: newValue };
    }
    if (node.children.length > 0) {
      return { ...node, children: updateNodeProperty(node.children, id, property, value) };
    }
    return node;
  });
};