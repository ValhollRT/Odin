import React, { useState, useCallback } from "react";
import { useAppContext } from "../../context/AppContext";
import "./scene-tree-styles.css";
import { createGeometry, geometryData, OdinPlugin, PluginType } from "../../engine/GeometryFactory";
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { generarUUID } from "../../context/utils";

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
  const { scene, nodes, setNodes, setMeshes, setSelectedNodes, selectedNodes } = useAppContext();
  const [treeData, setTreeData] = useState<TreeNode[]>(nodes);
  const [draggingNode, setDraggingNode] = useState<TreeNode | null>(null);
  const [targetNode, setTargetNode] = useState<TreeNode | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "inside" | "after" | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<{ id: string; type: PluginType } | null>(null);

  console.log("XXX treeData", treeData);
  console.log("XXX Nodes", nodes);

  // Función recursiva para renderizar los nodos del árbol
  const renderNode = (node: TreeNode, level: number) => {
    const isDraggingOver = targetNode?.id === node.id;
    const isExpanded = node.children.length > 0 && nodes.find((c) => c.id === node.id)?.isExpanded;

    const renderPluginIcon = (plugin: OdinPlugin) => {
      console.log("renderPluginIcon", plugin);
      if (React.isValidElement(plugin.icon)) {
        return React.cloneElement(plugin.icon);
      }
      return null;
    };

    return (
      <>
        <div
          key={node.id}
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDrop={(e) => handleDrop(e, node)}
          className={`scene-tree-item-content ${isDraggingOver ? `scene-tree-item-over scene-tree-item-over-${dropPosition}` : ""} ${selectedNodes.includes(node.id) ? "selected-icon" : ""}`}
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
              {renderPluginIcon(plugin)}
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

  // Función para encontrar el nodo padre dado un ID de hijo
  const findParentNode = (nodes: TreeNode[], childId: string): TreeNode | null => {
    for (const node of nodes) {
      // Comprueba si alguno de los hijos directos tiene el ID buscado
      if (node.children.some((child) => child.id === childId)) {
        return node;
      }
      // Si no está en los hijos directos, busca recursivamente en los hijos
      const foundInChildren = findParentNode(node.children, childId);
      if (foundInChildren) return foundInChildren;
    }
    return null;
  };

  // Actualizar el findNode existente para hacerlo más robusto
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

  // Función auxiliar para actualizar nodos
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

  // 3. Modificamos el handleDrop
  const handleDrop = useCallback(
    (e: React.DragEvent, targetNode: TreeNode) => {
      e.preventDefault();
      e.stopPropagation();

      const draggedNodeId = e.dataTransfer.getData("nodeId");
      const iconType = e.dataTransfer.getData("iconType") as PluginType;

      // Manejo de drop de iconos (sin cambios)
      if (iconType) {
        setTreeData((prevTree) => {
          const draggedNode = findNode(prevTree, draggedNodeId);
          if (!draggedNode) return prevTree;
          return updateNodeIcons(prevTree, targetNode.id, [...(targetNode.plugins.map((p) => p.type) || []), iconType]);
        });
        return;
      }

      if (!draggedNodeId || draggedNodeId === targetNode.id) {
        return;
      }

      setTreeData((prevTree) => {
        // En lugar de usar JSON.parse/stringify, creamos una función de clonado que preserve los iconos
        const cloneNode = (node: TreeNode): TreeNode => {
          return {
            ...node,
            plugins: node.plugins.map((plugin) => ({
              ...plugin,
              // Preservamos el icono original
              icon: plugin.icon,
            })),
            children: node.children.map((child) => cloneNode(child)),
          };
        };

        // Clonamos el árbol preservando los iconos
        const newTree = prevTree.map((node) => cloneNode(node));

        const sourceNode = findNode(newTree, draggedNodeId);
        const sourceParent = findParentNode(newTree, draggedNodeId);

        if (!sourceNode) return prevTree;

        // El resto del código de handleDrop sigue igual...
        if (sourceParent) {
          sourceParent.children = sourceParent.children.filter((child) => child.id !== draggedNodeId);
        } else {
          const index = newTree.findIndex((node: TreeNode) => node.id === draggedNodeId);
          if (index !== -1) {
            newTree.splice(index, 1);
          }
        }

        switch (dropPosition) {
          case "inside":
            const targetNodeInTree = findNode(newTree, targetNode.id);
            if (targetNodeInTree) {
              targetNodeInTree.children.push(sourceNode);
            }
            break;

          case "before":
          case "after": {
            const targetParent = findParentNode(newTree, targetNode.id);
            const targetArray = targetParent ? targetParent.children : newTree;
            const targetIndex = targetArray.findIndex((node) => node.id === targetNode.id);

            if (targetIndex !== -1) {
              const insertIndex = dropPosition === "after" ? targetIndex + 1 : targetIndex;
              targetArray.splice(insertIndex, 0, sourceNode);
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
    [dropPosition]
  );

  const handleMainDrop = (e: React.DragEvent) => {
    const geometryType = e.dataTransfer.getData("geometryType") as PluginType;

    console.log("XXX geometryType", geometryType);

    if (geometryType) {
      const typeData = geometryData.find((data) => data.name.toLowerCase() === geometryType);

      if (typeData && scene) {
        const result = createGeometry(scene, typeData);
        if (result) {
          const { mesh, plugins } = result;
          mesh && setMeshes((prev) => [...prev, mesh]);

          if (mesh) {
            const guid = generarUUID();
            const newNode: TreeNode = {
              id: guid,
              name: guid,
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
    console.log("XXX NODE", node);
    if (e.shiftKey) {
      setSelectedNodes((prev) => {
        const newSelection = prev.includes(node.id) ? prev.filter((id) => id !== node.id) : [...prev, node.id];
        return newSelection;
      });
    } else {
      setSelectedNodes([node.id]);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent, node: TreeNode) => {
    e.stopPropagation();
    // TODO EDIT NAME NODE
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
      // Mantenemos los plugins existentes, solo actualizamos los iconos
      return { ...node, plugins: node.plugins };
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
