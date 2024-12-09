import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Folder,
  Box,
  Type,
  Image,
  Video,
  Music,
} from "lucide-react";
import { Container, IconType, useAppContext } from "../../context/AppContext";

export const ObjectItem: React.FC<{
  object: Container;
  level: number;
  expandedItems: Set<string>;
  toggleExpand: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string, iconType?: IconType) => void;
  onDrop: (id: string, iconType?: IconType) => void;
  draggingId: string | null;
  overId: string | null;
  overPosition: "before" | "inside" | "after" | null;
  setOverId: React.Dispatch<React.SetStateAction<string | null>>;
  setOverPosition: React.Dispatch<React.SetStateAction<"before" | "inside" | "after" | null>>;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  onIconClick: (id: string, iconType: IconType) => void;
  selectedIcon: { id: string; type: IconType } | null;
  removeIcon: (id: string, iconType: IconType) => void;
  renameObject: (id: string, newName: string) => void;
}> = ({
  object,
  level,
  expandedItems,
  toggleExpand,
  onDragStart,
  onDrop,
  draggingId,
  overId,
  overPosition,
  setOverId,
  setOverPosition,
  toggleVisibility,
  toggleLock,
  onIconClick,
  selectedIcon,
  removeIcon,
  renameObject,
}) => {
  const { selectedContainers, setSelectedContainers } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(object.name);
  const isExpanded = expandedItems.has(object.id);
  const isDragging = draggingId === object.id;
  const isOver = overId === object.id;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    let position: "before" | "inside" | "after" = "inside";
    if (y < height * 0.25) position = "before";
    else if (y > height * 0.75) position = "after";
    setOverId(object.id);
    setOverPosition(position);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const iconType = e.dataTransfer.getData("text/plain") as IconType;
    onDrop(object.id, iconType || undefined);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedContainers((prev) => {
        const newSelection = prev.includes(object.id) ? prev.filter((id) => id !== object.id) : [...prev, object.id];
        return newSelection;
      });
    } else {
      setSelectedContainers([object.id]);
    }
    console.log(object.id)
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (editName.trim() !== "") {
      renameObject(object.id, editName.trim());
    } else {
      setEditName(object.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    }
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedIcon && selectedIcon.id === object.id) {
        removeIcon(selectedIcon.id, selectedIcon.type);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIcon, removeIcon, object.id]);

  return (
    <div>
      <div
        className={`scene-tree-item 
      ${isDragging ? "scene-tree-item-dragging" : ""} 
      ${isOver ? "scene-tree-item-over" : ""} 
      ${isOver && overPosition === "before" ? "scene-tree-item-over-before" : ""} 
      ${isOver && overPosition === "after" ? "scene-tree-item-over-after" : ""} 
      ${isOver && overPosition === "inside" ? "scene-tree-item-over-inside" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          className={`
    ${"scene-tree-item-content"}
    ${
      selectedContainers.includes(object.id)
        ? selectedContainers[selectedContainers.length - 1] === object.id
          ? "selected-icon"
          : "scene-tree-item-over"
        : ""
    }
  `}
          draggable
          onDragStart={(e) => onDragStart(e, object.id)}
          onClick={handleContainerClick}
          onDoubleClick={handleDoubleClick}
        >
          {object.children.length > 0 && (
            <button className="expand-button" onClick={() => toggleExpand(object.id)}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <div style={{ display: "flex", flexDirection: "column", marginRight: "0.5rem" }}>
            <div
              className="visibility-icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(object.id);
              }}
            >
              {object.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </div>
            <div
              className="lock-icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(object.id);
              }}
            >
              {object.locked ? <Lock size={16} /> : <Unlock size={16} />}
            </div>
          </div>
          {object.icons.map((iconType, index) => (
            <div
              key={index}
              className={`
                ${"object-icon"} 
                ${selectedIcon && selectedIcon.id === object.id && selectedIcon.type === iconType 
                  ? "selected-icon" 
                  : ""
                }
              `}
              draggable
              onDragStart={(e) => onDragStart(e, object.id, iconType)}
              onClick={() => onIconClick(object.id, iconType)}
            >
              {getTypeIcon(iconType)}
            </div>
          ))}
          {isEditing ? (
            <input
              className="name-input"
              value={editName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span>{object.name}</span>
          )}
        </div>
      </div>
      {isExpanded && object.children.length > 0 && (
        <div className="scene-tree-item-children">
          {object.children.map((child) => (
            <ObjectItem
              key={child.id}
              object={child}
              level={level + 1}
              expandedItems={expandedItems}
              toggleExpand={toggleExpand}
              onDragStart={onDragStart}
              onDrop={onDrop}
              draggingId={draggingId}
              overId={overId}
              overPosition={overPosition}
              setOverId={setOverId}
              setOverPosition={setOverPosition}
              toggleVisibility={toggleVisibility}
              toggleLock={toggleLock}
              onIconClick={onIconClick}
              selectedIcon={selectedIcon}
              removeIcon={removeIcon}
              renameObject={renameObject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
