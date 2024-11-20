import React, { useState, useCallback } from "react";
import { IconType, initialMockObjects } from "./initialMockObjects";
import { findAndRemoveItemById, findObjectById, insertItem, updateObjectIcons, updateObjectProperty } from "./utils";
import { ObjectItem } from "./objectItem";
import './scene-tree-styles.css';


export default function SceneTree() {
  const [sceneObjects, setSceneObjects] = useState(initialMockObjects);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["1"]));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overPosition, setOverPosition] = useState<"before" | "inside" | "after" | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<{ id: string; type: IconType } | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, id: string, iconType?: IconType) => {
    setDraggingId(id);
    if (iconType) {
      e.dataTransfer.setData("text/plain", iconType);
    }
  }, []);

  const handleDrop = useCallback(
    (targetId: string, iconType?: IconType) => {
      setSceneObjects((prev) => {
        if (iconType) {
          const targetObject = findObjectById(prev, targetId);
          if (targetObject) {
            const newIcons = [...targetObject.icons];
            if (!newIcons.includes(iconType)) {
              newIcons.push(iconType);
            }
            return updateObjectIcons(prev, targetId, newIcons);
          }
        } else {
          // Lógica para mover el contenedor completo
          const [draggedItem, updatedTree] = findAndRemoveItemById([...prev], draggingId!);
          if (draggedItem) {
            return insertItem(updatedTree, draggedItem, targetId, overPosition || "inside");
          }
        }
        return prev;
      });

      setDraggingId(null);
      setOverId(null);
      setOverPosition(null);
    },
    [draggingId, overPosition]
  );

  const toggleVisibility = useCallback((id: string) => {
    setSceneObjects((prev) => updateObjectProperty(prev, id, "visible", (value: boolean) => !value));
  }, []);

  const toggleLock = useCallback((id: string) => {
    setSceneObjects((prev) => updateObjectProperty(prev, id, "locked", (value: boolean) => !value));
  }, []);

  const handleIconClick = useCallback((id: string, iconType: IconType) => {
    setSelectedIcon((prev) => (prev && prev.id === id && prev.type === iconType ? null : { id, type: iconType }));
  }, []);

  const removeIcon = useCallback((id: string, iconType: IconType) => {
    setSceneObjects((prev) => {
      const targetObject = findObjectById(prev, id);
      if (targetObject) {
        const newIcons = targetObject.icons.filter((icon) => icon !== iconType);
        return updateObjectIcons(prev, id, newIcons);
      }
      return prev;
    });
    setSelectedIcon(null);
  }, []);

  const renameObject = useCallback((id: string, newName: string) => {
    setSceneObjects((prev) => updateObjectProperty(prev, id, "name", newName));
  }, []);

  return (
    <div className="scene-tree">
      <div className="scene-tree-header">
        <input className="header-input" placeholder="Search..." />
      </div>
      <div className="scene-tree-content">
        {sceneObjects.map((object) => (
          <ObjectItem
            key={object.id}
            object={object}
            level={0}
            expandedItems={expandedItems}
            toggleExpand={toggleExpand}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            draggingId={draggingId}
            overId={overId}
            overPosition={overPosition}
            setOverId={setOverId}
            setOverPosition={setOverPosition}
            toggleVisibility={toggleVisibility}
            toggleLock={toggleLock}
            onIconClick={handleIconClick}
            selectedIcon={selectedIcon}
            removeIcon={removeIcon}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            renameObject={renameObject}
          />
        ))}
      </div>
    </div>
  );
}
