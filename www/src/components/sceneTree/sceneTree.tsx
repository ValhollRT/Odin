import React, { useState, useCallback } from "react";
import { useAppContext } from "../../context/AppContext";
import "./scene-tree-styles.css";
import { createGeometry, geometryData, OdinPlugin, PluginType } from "../../engine/GeometryFactory";
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Box,
  Type,
  Image,
  Video,
  Music,
  Move3DIcon,
} from "lucide-react";

export interface TreeNode {
  id: string;
  color?: string;
  name: string;
  isExpanded?: boolean;
  plugins: OdinPlugin[];
  visible: boolean;
  locked: boolean;
  children: TreeNode[];
}

export const SceneTree: React.FC = () => {
  const { scene, nodes: containers, setNodes, setMeshes } = useAppContext();
  const [treeData, setTreeData] = useState<TreeNode[]>(containers);
  const [draggingNode, setDraggingNode] = useState<TreeNode | null>(null);
  const [targetNode, setTargetNode] = useState<TreeNode | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "inside" | "after" | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<{ id: string; type: PluginType } | null>(null);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);

  // Función recursiva para renderizar los nodos del árbol
  const renderNode = (node: TreeNode, level: number) => {
    const isDraggingOver = targetNode?.id === node.id;
    const isExpanded = node.children.length > 0 && containers.find((c) => c.id === node.id)?.isExpanded;

    return (
      <>
        <div
          key={node.id}
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDrop={(e) => handleDrop(e, node)}
          className={`scene-tree-item-content ${isDraggingOver ? `scene-tree-item-over scene-tree-item-over-${dropPosition}` : ""} ${selectedContainers.includes(node.id) ? "selected-icon" : ""}`}
          onClick={(e) => handleContainerClick(e, node)}
          onDoubleClick={(e) => handleDoubleClick(e, node)}
        >
          {node.children.length > 0 && (
            <button
              className="expand-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
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
          {node.plugins?.map((plugin, index) => (
            <div
              key={index}
              className={`object-icon ${
                selectedIcon && selectedIcon.id === node.id && selectedIcon.type === plugin.type ? "selected-icon" : ""
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, node, plugin.type)}
              onClick={() => handleIconClick(node.id, plugin.type)}
            >
              {getTypeIcon(plugin.type)}
            </div>
          ))}
          <span>{node.name}</span>
        </div>
        {isExpanded && (
          <div className="scene-tree-item-children">{node.children.map((child) => renderNode(child, level + 1))}</div>
        )}
      </>
    );
  };

  const handleDragStart = useCallback((e: React.DragEvent, node: TreeNode, iconType?: PluginType) => {
    setDraggingNode(node);
    e.dataTransfer.setData("nodeId", node.id);
    if (iconType) {
      e.dataTransfer.setData("iconType", iconType);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, node: TreeNode) => {
    e.preventDefault(); // Permite el drop
    e.stopPropagation(); // Evita propagación a padres
    const firstChild = e.currentTarget;
    if (!firstChild) return;

    const rect = firstChild.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Calcular la posición relativa dentro del elemento
    let position: "before" | "inside" | "after" = "inside";
    if (y < rect.height * 0.33) {
      position = "before";
    } else if (y > rect.height * 0.67) {
      position = "after";
    }

    setTargetNode(node);
    setDropPosition(position);
  }, []);

  // 1. Primero la función findNodeAndParent
  const findNodeAndParent = useCallback(
    (
      nodes: TreeNode[],
      id: string,
      parent: TreeNode | null = null
    ): { node: TreeNode; parent: TreeNode | null } | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return { node, parent };
        }
        if (node.children.length > 0) {
          const result = findNodeAndParent(node.children, id, node);
          if (result) return result;
        }
      }
      return null;
    },
    []
  );

  // 2. Función para verificar si un nodo es descendiente de otro
  const isDescendant = useCallback((parent: TreeNode, child: TreeNode): boolean => {
    if (parent.id === child.id) return true;
    return parent.children.some((node) => isDescendant(node, child));
  }, []);

  // 3. Modificamos el handleDrop
  const handleDrop = useCallback(
    (e: React.DragEvent, targetNode: TreeNode) => {
      e.preventDefault();
      e.stopPropagation(); // Evita propagación a padres

      const draggedNodeId = e.dataTransfer.getData("nodeId");
      const iconType = e.dataTransfer.getData("iconType") as PluginType;

      // Si es un drop de icono, mantenemos la lógica existente
      if (iconType) {
        setTreeData((prevTree) => {
          const draggedNode = findNode(prevTree, draggedNodeId);
          if (!draggedNode) return prevTree;
          return updateNodeIcons(prevTree, targetNode.id, [...(targetNode.plugins.map((p) => p.type) || []), iconType]);
        });
        return;
      }

      // Validaciones importantes
      if (!draggedNodeId || draggedNodeId === targetNode.id) {
        return;
      }

      setTreeData((prevTree) => {
        // 1. Encontrar el nodo arrastrado y su padre
        const draggedNodeInfo = findNodeAndParent(prevTree, draggedNodeId);
        if (!draggedNodeInfo) return prevTree;

        const { node: draggedNode, parent: draggedParent } = draggedNodeInfo;

        // 2. Validar que no estamos intentando mover un nodo a uno de sus descendientes
        if (isDescendant(draggedNode, targetNode)) {
          return prevTree;
        }

        // 3. Crear una copia del árbol
        const newTree = JSON.parse(JSON.stringify(prevTree));

        // 4. Encontrar las nuevas referencias en el árbol copiado
        const newDraggedNodeInfo = findNodeAndParent(newTree, draggedNodeId);
        const newTargetNodeInfo = findNodeAndParent(newTree, targetNode.id);

        if (!newDraggedNodeInfo || !newTargetNodeInfo) return prevTree;

        const { node: newDraggedNode, parent: newDraggedParent } = newDraggedNodeInfo;
        const { node: newTargetNode, parent: newTargetParent } = newTargetNodeInfo;

        // 5. Remover el nodo de su posición original
        if (newDraggedParent) {
          newDraggedParent.children = newDraggedParent.children.filter((child) => child.id !== draggedNodeId);
        } else {
          const index = newTree.findIndex((node: TreeNode) => node.id === draggedNodeId);
          if (index !== -1) {
            newTree.splice(index, 1);
          }
        }

        // 6. Insertar el nodo en la nueva posición según dropPosition
        const position = dropPosition || "inside";

        switch (position) {
          case "inside":
            // El nodo se convierte en hijo del target
            newTargetNode.children.push(newDraggedNode);
            break;

          case "before":
          case "after": {
            // Para before y after, necesitamos insertar en el mismo nivel que el target
            const targetArray = newTargetParent ? newTargetParent.children : newTree;
            const targetIndex = targetArray.findIndex((node: TreeNode) => node.id === newTargetNode.id);

            if (targetIndex !== -1) {
              // Para "before" insertamos en el índice actual
              // Para "after" insertamos en el índice siguiente
              const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
              targetArray.splice(insertIndex, 0, newDraggedNode);
            }
            break;
          }
        }

        return newTree;
      });

      setDraggingNode(null);
      setTargetNode(null);
      setDropPosition(null);
    },
    [dropPosition, findNodeAndParent, isDescendant]
  );

  const handleMainDrop = (e: React.DragEvent) => {
    const geometryType = e.dataTransfer.getData("geometryType") as PluginType;

    if (geometryType) {
      const typeData = geometryData.find((data) => data.name.toLowerCase() === geometryType);

      if (typeData && scene) {
        const result = createGeometry(scene, typeData);
        if (result) {
          const { mesh, plugins } = result;
          mesh && setMeshes((prev) => [...prev, mesh]);

          if (mesh) {
            const newNode: TreeNode = {
              id: mesh.id,
              name: mesh.name,
              isExpanded: false,
              visible: true,
              locked: true,
              children: [],
              plugins: plugins ?? [],
            };
            setNodes((prev) => [...prev, newNode]);
            setTreeData((prevTree) => [...prevTree, newNode]);
          }
        }
      }
    }
  };

  const handleMainDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleExpand = useCallback((id: string) => {
    setNodes((prev) => {
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

  const handleIconClick = useCallback((id: string, iconType: PluginType) => {
    setSelectedIcon((prev) => (prev && prev.id === id && prev.type === iconType ? null : { id, type: iconType }));
  }, []);

  const handleContainerClick = (e: React.MouseEvent, node: TreeNode) => {
    e.stopPropagation();
    console.log("XXX NODE", node)
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
    // TODO EDIT NAME NODE
  };

  const getTypeIcon = (type: PluginType) => {
    switch (type) {
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
        return <Move3DIcon />;
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

const updateNodeIcons = (nodes: TreeNode[], id: string, newIcons: PluginType[]): TreeNode[] => {
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
