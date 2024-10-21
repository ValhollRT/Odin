import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "../ui/ContextMenu";
import { Object3D, Directory } from "./interfaces";
import { DIRECTORY_HEIGHT, OBJECT_HEIGHT, PROPERTY_HEIGHT } from "./utils";

export const ObjectPanel: React.FC<{
    objects: Object3D[];
    directories: Directory[];
    selectedProperty: { objectId: string; property: string } | null;
    onAddProperty: (objectId: string, property: string) => void;
    onRemoveProperty: (objectId: string, property: string) => void;
    onSelectProperty: (objectId: string, property: string) => void;
    collapsedObjects: Set<string>;
    onToggleCollapse: (objectId: string) => void;
    onDragProperty: (
      sourceObjectId: string,
      targetObjectId: string,
      property: string,
      keepSource: boolean
    ) => void;
    onMoveObjectToDirectory: (objectId: string, directoryId: string) => void;
  }> = ({
    objects,
    directories,
    selectedProperty,
    onAddProperty,
    onRemoveProperty,
    onSelectProperty,
    collapsedObjects,
    onToggleCollapse,
    onDragProperty,
    onMoveObjectToDirectory,
  }) => {
    const [draggedProperty, setDraggedProperty] = useState<{
      objectId: string;
      property: string;
    } | null>(null);
  
    const handleDragStart =
      (objectId: string, property?: string) => (e: React.DragEvent) => {
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({ objectId, property })
        );
        if (property) {
          setDraggedProperty({ objectId, property });
        }
      };
  
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };
  
    const handleDrop =
      (targetDirectoryId: string, targetObjectId?: string) =>
      (e: React.DragEvent) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (data.property && targetObjectId) {
          onDragProperty(
            data.objectId,
            targetObjectId,
            data.property,
            e.shiftKey
          );
        } else if (data.objectId) {
          onMoveObjectToDirectory(data.objectId, targetDirectoryId);
        }
        setDraggedProperty(null);
      };
  
    return (
      <div className="object-panel">
        <div className="object-panel-content">
          {directories.map((directory) => (
            <div
              key={directory.id}
              onDragOver={handleDragOver}
              onDrop={handleDrop(directory.id)}
            >
              <h3
                className="directory-header"
                style={{ height: `${DIRECTORY_HEIGHT}px` }}
              >
                {directory.name}
              </h3>
              <ul>
                {objects
                  .filter((obj) => directory.objects.includes(obj.id))
                  .map((obj) => (
                    <li
                      key={obj.id}
                      className="object-item"
                      draggable
                      onDragStart={handleDragStart(obj.id)}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop(directory.id, obj.id)}
                    >
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div
                            className="object-header"
                            style={{ height: `${OBJECT_HEIGHT}px` }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleCollapse(obj.id);
                              }}
                              className="object-toggle"
                            >
                              {collapsedObjects.has(obj.id) ? (
                                <ChevronRight className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <span>{obj.name}</span>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          {!obj.properties.translation && (
                            <ContextMenuItem
                              onClick={() => onAddProperty(obj.id, "translation")}
                            >
                              Add Translation
                            </ContextMenuItem>
                          )}
                          {!obj.properties.rotation && (
                            <ContextMenuItem
                              onClick={() => onAddProperty(obj.id, "rotation")}
                            >
                              Add Rotation
                            </ContextMenuItem>
                          )}
                          {!obj.properties.scale && (
                            <ContextMenuItem
                              onClick={() => onAddProperty(obj.id, "scale")}
                            >
                              Add Scale
                            </ContextMenuItem>
                          )}
                          {!obj.properties.center && (
                            <ContextMenuItem
                              onClick={() => onAddProperty(obj.id, "center")}
                            >
                              Add Center
                            </ContextMenuItem>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                      {!collapsedObjects.has(obj.id) &&
                        Object.entries(obj.properties).map(([key, value]) => (
                          <ContextMenu key={key}>
                            <ContextMenuTrigger>
                              <Button
                                variant="ghost"
                                className={`property-button ${
                                  selectedProperty?.objectId === obj.id &&
                                  selectedProperty?.property === key
                                    ? "property-button-selected" // Nueva clase para el botón seleccionado
                                    : "property-button-default" // Nueva clase para el botón por defecto
                                }`}
                                onClick={() => onSelectProperty(obj.id, key)}
                                style={{ height: `${PROPERTY_HEIGHT}px` }}
                                draggable
                                onDragStart={handleDragStart(obj.id, key)}
                              >
                                {key}: ({value.x}, {value.y}, {value.z})
                              </Button>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem
                                onClick={() => onRemoveProperty(obj.id, key)}
                              >
                                Remove Property
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };
  