import { ChevronRight, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { ContextMenu, ContextMenuItem } from "../ui/ContextMenu";
import { Object3D, Directory } from "./interfaces";
import { TRACK_HEIGHT } from "./utils";
import { useAppContext } from "../../context/AppContext";

export const ObjectItem: React.FC<{
  object: Object3D;
  directoryId: string;
  onDrop: (targetDirectoryId: string, targetObjectId?: string) => (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragStart: (objectId: string, property?: string) => (e: React.DragEvent) => void;
  onToggleCollapse: (objectId: string) => void;
}> = ({ object, directoryId, onDrop, handleDragOver, handleDragStart, onToggleCollapse }) => {
  const { addProperty } = useAppContext(); // Contexto de aplicación para añadir propiedades
  const [collapsed, setCollapsed] = useState(false);
  const propertiesMock = ["translate", "rotate", "scale", "center"];

  return (
    <>
      <ContextMenu>
        <div
          key={object.id}
          data-object-id={object.id}
          className="object-item"
          draggable
          onDragStart={handleDragStart(object.id)}
          onDragOver={handleDragOver}
          onDrop={onDrop(directoryId, object.id)}
          onContextMenu={(e) => e.preventDefault()} // Desactiva el menú contextual nativo
          style={{ height: `${TRACK_HEIGHT}px` }}
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(object.id);
              setCollapsed(!collapsed);
            }}
            className="object-toggle"
          >
            {collapsed ? <ChevronRight /> : <ChevronDown />}
          </span>
          <span>{object.name}</span>
        </div>
        {propertiesMock.map((property) => (
          <ContextMenuItem onClick={() => addProperty({ objectId: object.id, property })}>{property}</ContextMenuItem>
        ))}
      </ContextMenu>
      {!collapsed && (
        <ObjectProperties onDragStart={handleDragStart} properties={object.properties} objectId={object.id} />
      )}
    </>
  );
};

export const ObjectProperties: React.FC<{
  onDragStart: (objectId: string, property?: string) => (e: React.DragEvent) => void;
  properties: Record<string, { x: number; y: number; z: number }>;
  objectId: string;
}> = ({ onDragStart, properties, objectId }) => {
  const { removeProperty, selectedProperty, setSelectedProperty } = useAppContext();

  return (
    <>
      {Object.entries(properties).map(([key, value]) => (
        <ContextMenu key={`${key}-${objectId}`}>
          <div
            style={{ height: `${TRACK_HEIGHT}px` }}
            className={`property-button ${
              selectedProperty?.objectId === objectId && selectedProperty?.property === key
                ? "property-button-selected"
                : "property-button-default"
            }`}
            onClick={() => setSelectedProperty({ objectId, property: key })}
            draggable
            onDragStart={onDragStart(objectId, key)}
            key={`${objectId}-${key}`}
            data-property-id={`${objectId}-${key}`}
          >
            {key}
          </div>

          <ContextMenuItem
            onClick={() => {
              console.log(`Removing property: ${key} from object: ${objectId}`);
              removeProperty({ objectId: objectId, property: key });
            }}
          >
            Remove Property
          </ContextMenuItem>
        </ContextMenu>
      ))}
    </>
  );
};

export const ObjectPanel: React.FC<{
  objectPanelRef: React.RefObject<HTMLDivElement>;
  objects: Object3D[];
  directories: Directory[];
  collapsedObjects: Set<string>;
  onToggleCollapse: (objectId: string) => void;
  onDragProperty: (sourceObjectId: string, targetObjectId: string, property: string, keepSource: boolean) => void;
  onMoveObjectToDirectory: (objectId: string, directoryId: string) => void;
}> = ({
  objectPanelRef,
  objects,
  directories,
  collapsedObjects,
  onToggleCollapse,
  onDragProperty,
  onMoveObjectToDirectory,
}) => {
  const [draggedProperty, setDraggedProperty] = useState<{
    objectId: string;
    property: string;
  } | null>(null);

  const handleDragStart = (objectId: string, property?: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ objectId, property }));
    if (property) {
      setDraggedProperty({ objectId, property });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDirectoryId: string, targetObjectId?: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.property && targetObjectId) {
      onDragProperty(data.objectId, targetObjectId, data.property, e.shiftKey);
    } else if (data.objectId) {
      onMoveObjectToDirectory(data.objectId, targetDirectoryId);
    }
    setDraggedProperty(null);
  };

  return (
    <div className="object-panel">
      <div ref={objectPanelRef} className="object-panel-content">
        {directories.map((directory) => (
          <>
            <div
              key={directory.id}
              onDragOver={handleDragOver}
              onDrop={handleDrop(directory.id)}
              className="directory-header"
              style={{ height: `${TRACK_HEIGHT}px` }}
            >
              {directory.name}
            </div>

            {objects
              .filter((obj) => directory.objects.includes(obj.id))
              .map((obj) => (
                <ObjectItem
                  object={obj}
                  directoryId={directory.id}
                  onDrop={handleDrop}
                  handleDragOver={handleDragOver}
                  handleDragStart={handleDragStart}
                  onToggleCollapse={onToggleCollapse}
                />
              ))}
          </>
        ))}
      </div>
    </div>
  );
};
