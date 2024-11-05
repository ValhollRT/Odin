import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Object3D,
  Directory,
  SelectedKeyframe,
  AnimationData,
  RegionSelection,
  Keyframe,
} from "./interfaces";
import { TopMenu } from "./TopMenu";
import { KeyframeEditor } from "./KeyframeEditor";
import { PlaybackControls } from "./PlaybackControls";
import {
  INITIAL_GRID_SPACING,
  interpolateValue,
  DIRECTORY_HEIGHT,
  OBJECT_HEIGHT,
  PROPERTY_HEIGHT,
  calculateObjectPosition,
} from "./utils";
import { ObjectPanel } from "./ObjectPanel";
import { useAppContext } from "../../context/AppContext";

export default function AnimationTimelineEditor() {
  const {
    objects,
    setObjects,
    animationData,
    setAnimationData,
    selectedProperty,
  } = useAppContext();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(100);
  const [visibleFrames] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gridSpacing, setGridSpacing] = useState(INITIAL_GRID_SPACING);

  const [draggingKeyframe, setDraggingKeyframe] =
    useState<SelectedKeyframe | null>(null);
  const [selectedKeyframes, setSelectedKeyframes] = useState<
    SelectedKeyframe[]
  >([]);
  const [regionSelection, setRegionSelection] =
    useState<RegionSelection | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [draggingObjectBar, setDraggingObjectBar] = useState<{
    objectId: string;
    side: "left" | "right" | "middle";
  } | null>(null);
  const [dragStartFrame, setDragStartFrame] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  // const objectPanelRef = useRef<HTMLDivElement>(null);
  const [currentDirectoryId, setCurrentDirectoryId] = useState("default");
  const [showAll, setShowAll] = useState(false);
  const [collapsedObjects, setCollapsedObjects] = useState<Set<string>>(
    new Set()
  );
  const [undoStack, setUndoStack] = useState<AnimationData[]>([]);
  const [redoStack, setRedoStack] = useState<AnimationData[]>([]);
  const [, setScrollPosition] = useState({ x: 0, y: 0 });
  const [directories, setDirectories] = useState<Directory[]>([
    { id: "default", name: "Default", objects: [], currentFrame: 0 },
  ]);

  const addToUndoStack = (data: AnimationData) => {
    setUndoStack((prev) => [...prev, data]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const prevState = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [...prev, animationData]);
      setAnimationData(prevState);
      setUndoStack((prev) => prev.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, animationData]);
      setAnimationData(nextState);
      setRedoStack((prev) => prev.slice(0, -1));
    }
  };

  const addObject = () => {
    const newObject: Object3D = {
      id: `obj-${objects.length + 1}`,
      name: `Object ${objects.length + 1}`,
      properties: {},
    };
    setObjects([...objects, newObject]);
    setDirectories((dirs) =>
      dirs.map((dir) =>
        dir.id === currentDirectoryId
          ? { ...dir, objects: [...dir.objects, newObject.id] }
          : dir
      )
    );
  };

  const addDirectory = () => {
    const newDirectory: Directory = {
      id: `dir-${directories.length + 1}`,
      name: `Directory ${directories.length + 1}`,
      objects: [],
      currentFrame: 0,
    };
    setDirectories([...directories, newDirectory]);
  };

  const getLastKeyframeFrame = useCallback(() => {
    let lastFrame = 0;
    Object.values(animationData).forEach((objectData) => {
      Object.values(objectData).forEach((propertyKeyframes) => {
        const maxFrame = Math.max(...propertyKeyframes.map((k) => k.frame));
        lastFrame = Math.max(lastFrame, maxFrame);
      });
    });
    return lastFrame;
  }, [animationData]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const getInterpolatedValue = useCallback(
    (objectId: string, property: string, frame: number) => {
      const keyframes = animationData[objectId]?.[property] || [];
      if (keyframes.length === 0) return null;

      const prevKeyframe = keyframes.reduce(
        (prev, curr) => (curr.frame <= frame ? curr : prev),
        keyframes[0]
      );

      const nextKeyframe =
        keyframes.find((k) => k.frame > frame) ||
        keyframes[keyframes.length - 1];

      if (prevKeyframe === nextKeyframe) return prevKeyframe.value;

      const t =
        (frame - prevKeyframe.frame) /
        (nextKeyframe.frame - prevKeyframe.frame);
      return {
        x: interpolateValue(prevKeyframe.value.x, nextKeyframe.value.x, t),
        y: interpolateValue(prevKeyframe.value.y, nextKeyframe.value.y, t),
        z: interpolateValue(prevKeyframe.value.z, nextKeyframe.value.z, t),
      };
    },
    [animationData]
  );

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      if (isPlaying) {
        setDirectories((prevDirs) => {
          const newDirs = prevDirs.map((dir) => {
            if (showAll || dir.id === currentDirectoryId) {
              const newFrame = dir.currentFrame + 1;
              if (newFrame <= getLastKeyframeFrame()) {
                return { ...dir, currentFrame: newFrame };
              }
            }
            return dir;
          });

          if (
            newDirs.every((dir) => dir.currentFrame >= getLastKeyframeFrame())
          ) {
            setIsPlaying(false);
          }

          return newDirs;
        });

        // Actualizar los valores interpolados para todas las propiedades
        objects.forEach((obj) => {
          Object.keys(obj.properties).forEach((prop) => {
            const interpolatedValue = getInterpolatedValue(
              obj.id,
              prop,
              currentFrame
            );
            if (interpolatedValue) {
              setObjects((prevObjects) =>
                prevObjects.map((o) =>
                  o.id === obj.id
                    ? {
                        ...o,
                        properties: {
                          ...o.properties,
                          [prop]: interpolatedValue,
                        },
                      }
                    : o
                )
              );
            }
          });
        });

        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [
    isPlaying,
    currentFrame,
    animationData,
    objects,
    showAll,
    currentDirectoryId,
    getLastKeyframeFrame,
    getInterpolatedValue,
    setObjects,
  ]);

  const addKeyframe = () => {
    if (selectedProperty) {
      const { objectId, property } = selectedProperty;
      const existingKeyframes = animationData[objectId]?.[property] || [];

      const prevKeyframe = [...existingKeyframes]
        .reverse()
        .find((k) => k.frame <= currentFrame);
      const nextKeyframe = existingKeyframes.find(
        (k) => k.frame >= currentFrame
      );

      let newKeyframeValue: { x: number; y: number; z: number };
      let newAngle = 0;
      let newWeight = 0;

      if (prevKeyframe && nextKeyframe && prevKeyframe !== nextKeyframe) {
        const totalDuration = nextKeyframe.frame - prevKeyframe.frame;
        const fraction = (currentFrame - prevKeyframe.frame) / totalDuration;
        newKeyframeValue = {
          x: interpolateValue(
            prevKeyframe.value.x,
            nextKeyframe.value.x,
            fraction
          ),
          y: interpolateValue(
            prevKeyframe.value.y,
            nextKeyframe.value.y,
            fraction
          ),
          z: interpolateValue(
            prevKeyframe.value.z,
            nextKeyframe.value.z,
            fraction
          ),
        };
        newAngle = prevKeyframe.angle;
        newWeight = prevKeyframe.weight;
      } else if (prevKeyframe) {
        newKeyframeValue = { ...prevKeyframe.value };
        newAngle = prevKeyframe.angle;
        newWeight = prevKeyframe.weight;
      } else if (nextKeyframe) {
        newKeyframeValue = { ...nextKeyframe.value };
        newAngle = nextKeyframe.angle;
        newWeight = nextKeyframe.weight;
      } else {
        newKeyframeValue = objects.find((obj) => obj.id === objectId)
          ?.properties[property] || { x: 0, y: 0, z: 0 };
      }

      const newKeyframe: Keyframe = {
        id: `keyframe-${Date.now()}`,
        frame: currentFrame,
        value: newKeyframeValue,
        angle: newAngle,
        weight: newWeight,
      };

      setAnimationData((prevData) => ({
        ...prevData,
        [objectId]: {
          ...prevData[objectId],
          [property]: [
            ...(prevData[objectId]?.[property] || []),
            newKeyframe,
          ].sort((a, b) => a.frame - b.frame),
        },
      }));
    }
  };

const [initialKeyframeFrames, setInitialKeyframeFrames] = useState<Map<string, number>>(new Map());

  const handleKeyframeMouseDown =
    (objectId: string, property: string, keyframeId: string) =>
    (e: React.MouseEvent) => {
      e.stopPropagation();

      console.log("handleKeyframeMouseDown");
      const isAlreadySelected = selectedKeyframes.some(
        (sk) =>
          sk.objectId === objectId &&
          sk.property === property &&
          sk.keyframeId === keyframeId
      );

      const rect = timelineRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setDragStartFrame(Math.round((x / rect.width) * totalFrames));

      console.log("XXX handleKeyframeMouseDown", isAlreadySelected);

        // Store initial frames of selected keyframes
        const initialFrames = new Map<string, number>();
        selectedKeyframes.forEach(({ objectId, property, keyframeId }) => {
          const keyframe = animationData[objectId][property].find(k => k.id === keyframeId);
          if (keyframe) {
            initialFrames.set(keyframeId, keyframe.frame);
          }
        });
        setInitialKeyframeFrames(initialFrames);

      if (isCtrlPressed) {
        // Crear copias de todos los keyframes seleccionados
        const copiedKeyframes = selectedKeyframes
          .map((sk) => {
            const originalKeyframe = animationData[sk.objectId][
              sk.property
            ].find((k) => k.id === sk.keyframeId);
            if (originalKeyframe) {
              return {
                ...originalKeyframe,
                id: `keyframe-copy-${Date.now()}-${Math.random()}`,
                objectId: sk.objectId,
                property: sk.property,
              };
            }
            return null;
          })
          .filter(Boolean) as Keyframe[];

        setDraggingKeyframe({
          objectId,
          property,
          keyframeId: copiedKeyframes[0].id,
          isCopy: true,
          copiedKeyframes,
        });

        setSelectedKeyframes(
          copiedKeyframes.map((ck) => ({
            objectId: ck.objectId,
            property: ck.property,
            keyframeId: ck.id,
            isCopy: true,
          }))
        );

        // Añadir temporalmente los keyframes copiados a los datos de animación
        setAnimationData((prevData) => {
          const newData = { ...prevData };
          copiedKeyframes.forEach((ck) => {
            if (!newData[ck.objectId]) newData[ck.objectId] = {};
            if (!newData[ck.objectId][ck.property])
              newData[ck.objectId][ck.property] = [];
            newData[ck.objectId][ck.property].push(ck);
          });
          return newData;
        });
      } else if (isAlreadySelected && selectedKeyframes.length > 1) {
        // Si el keyframe ya está seleccionado y hay múltiples seleccionados, mantener la selección
        setDraggingKeyframe({ objectId, property, keyframeId });
      } else {
        // Comportamiento existente para selección individual o nueva
        setDraggingKeyframe({ objectId, property, keyframeId });
        if (!isShiftPressed) {
          setSelectedKeyframes([{ objectId, property, keyframeId }]);
        } else {
          setSelectedKeyframes((prev) => {
            if (isAlreadySelected) {
              return prev.filter(
                (k) =>
                  k.objectId !== objectId ||
                  k.property !== property ||
                  k.keyframeId !== keyframeId
              );
            }
            return [...prev, { objectId, property, keyframeId }];
          });
        }
      }
    };

  const handleObjectBarMouseDown = (
    objectId: string,
    e: React.MouseEvent,
    side: "left" | "right" | "middle"
  ) => {
    e.stopPropagation();
    setDraggingObjectBar({ objectId, side });
    const rect = timelineRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDragStartFrame(Math.round((x / rect.width) * totalFrames));
  };

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (
      timelineRef.current &&
      (isShiftPressed || (isCtrlPressed && isShiftPressed))
    ) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top + timelineRef.current.scrollTop;
      setRegionSelection({ startX: x, startY: y, endX: x, endY: y });
    } else if (!isCtrlPressed && !isShiftPressed) {
      setSelectedKeyframes([]);
    }
  };

  const calculateObjectDuration = useCallback((objectId: string) => {
    const objectKeyframes = animationData[objectId];
    if (!objectKeyframes) return { start: 0, end: 0 };

    let minFrame = Infinity;
    let maxFrame = -Infinity;

    Object.values(objectKeyframes).forEach((propertyKeyframes) => {
      propertyKeyframes.forEach((keyframe) => {
        minFrame = Math.min(minFrame, keyframe.frame);
        maxFrame = Math.max(maxFrame, keyframe.frame);
      });
    });

    return {
      start: minFrame === Infinity ? 0 : minFrame,
      end: maxFrame === -Infinity ? 0 : maxFrame,
    };
  },[animationData]);

  const handleTimelineMouseMove = useCallback( async (e: React.MouseEvent) => {
    if (draggingObjectBar && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newFrame = Math.max(
        0,
        Math.min(Math.round((x / rect.width) * totalFrames), totalFrames)
      );

      if (dragStartFrame !== null) {
        const { objectId, side } = draggingObjectBar;
        const objectDuration = calculateObjectDuration(objectId);

        setAnimationData((prevData) => {
          const newData = { ...prevData };
          Object.keys(newData[objectId]).forEach((property) => {
            newData[objectId][property] = newData[objectId][property].map(
              (keyframe) => {
                console.log("XXX keyframe", keyframe);
                let newKeyframeFrame: number;

                if (side === "left") {
                  // Calcular la escala proporcional desde la izquierda
                  const scale =
                    (objectDuration.end - newFrame) /
                    (objectDuration.end - objectDuration.start);
                  newKeyframeFrame = Math.round(
                    objectDuration.end -
                      (objectDuration.end - keyframe.frame) * scale
                  );
                } else if (side === "right") {
                  // Calcular la escala proporcional desde la derecha
                  const scale =
                    (newFrame - objectDuration.start) /
                    (objectDuration.end - objectDuration.start);
                  newKeyframeFrame = Math.round(
                    objectDuration.start +
                      (keyframe.frame - objectDuration.start) * scale
                  );
                } else {
                  // Mover todos los keyframes (comportamiento existente)
                  const frameDiff = newFrame - dragStartFrame;
                  newKeyframeFrame = keyframe.frame + frameDiff;
                }

                // Asegurarse de que el nuevo frame esté dentro del rango permitido
                newKeyframeFrame = Math.max(
                  0,
                  Math.min(newKeyframeFrame, totalFrames)
                );

                return { ...keyframe, frame: newKeyframeFrame };
              }
            );
          });
          return newData;
        });

        setDragStartFrame(newFrame);
      }
    } else if (draggingKeyframe && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newFrame = Math.max(
        0,
        Math.min(Math.round((x / rect.width) * totalFrames), totalFrames)
      );
      if (draggingKeyframe.isCopy && draggingKeyframe.copiedKeyframes) {
        // Mover todos los keyframes copiados
        const offset = newFrame - draggingKeyframe.copiedKeyframes[0].frame;
        console.log(
          "keyframe YES copied",
          offset,
          newFrame,
          draggingKeyframe.copiedKeyframes[0].frame
        );

        setAnimationData((prevData) => {
          const newData = { ...prevData };
          draggingKeyframe.copiedKeyframes?.forEach((ck) => {
            const keyframeIndex = newData[ck.objectId][ck.property].findIndex(
              (k) => k.id === ck.id
            );
            if (keyframeIndex !== -1) {
              newData[ck.objectId][ck.property][keyframeIndex] = {
                ...newData[ck.objectId][ck.property][keyframeIndex],
                frame: Math.max(0, Math.min(ck.frame + offset, totalFrames)),
              };
            }
          });
          return newData;
        });
      } else {
        // Mover todos los keyframes seleccionados
        const originalKeyframe = animationData[draggingKeyframe.objectId][
          draggingKeyframe.property
        ].find((k) => k.id === draggingKeyframe.keyframeId);
      
        if (originalKeyframe && dragStartFrame !== null) {
          const offset = newFrame - dragStartFrame;

          console.log(
            "keyframe NO copied",
            offset,
            newFrame,
            dragStartFrame
          );

          setAnimationData((prevData) => {
            const newData = { ...prevData };
            const originalPositions = new Map();
            
            // Primero, guardamos las posiciones originales
            selectedKeyframes.forEach(({ objectId, property, keyframeId }) => {
              const keyframe = prevData[objectId][property].find(k => k.id === keyframeId);
              console.log("XXX originalPositions", originalPositions, keyframe!.frame)
              if (keyframe) {
                originalPositions.set(keyframeId, keyframe.frame);
              }
            });
      
            // Luego, actualizamos las posiciones basándonos en las posiciones originales
       
            selectedKeyframes.forEach(({ objectId, property, keyframeId }) => {
              const keyframeIndex = newData[objectId][property].findIndex(
                (k) => k.id === keyframeId
              );

              if (keyframeIndex !== -1) {
                // Directly set the dragged keyframe's frame to newFrame
                if (keyframeId === draggingKeyframe.keyframeId) {
                  newData[objectId][property][keyframeIndex].frame = newFrame;
                } else {
                  // Apply offset to other selected keyframes
                  const originalPosition = initialKeyframeFrames.get(keyframeId); // <-- Get initial frame
                  const updatedFrame = Math.max(0, Math.min(originalPosition! + offset, totalFrames));
                  newData[objectId][property][keyframeIndex].frame = updatedFrame;
              
                }
              }
            });
      
            // Ordenar keyframes después de actualizar
            Object.keys(newData).forEach((objId) => {
              Object.keys(newData[objId]).forEach((prop) => {
                newData[objId][prop].sort((a, b) => a.frame - b.frame);
              });
            });
            
            return newData;
          });
        }
      }
    } else if (
      regionSelection &&
      timelineRef.current &&
      (isShiftPressed || (isCtrlPressed && isShiftPressed))
    ) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top + timelineRef.current.scrollTop;
      setRegionSelection((prev) => ({ ...prev!, endX: x, endY: y }));
    }
  }, [animationData, calculateObjectDuration, dragStartFrame, draggingKeyframe, draggingObjectBar, isCtrlPressed, isShiftPressed, regionSelection, selectedKeyframes, setAnimationData, totalFrames]);

  const handleTimelineMouseUp = () => {
    setDraggingObjectBar(null);
    setDragStartFrame(null);
    setInitialKeyframeFrames(new Map());
    if (
      draggingKeyframe &&
      draggingKeyframe.isCopy &&
      draggingKeyframe.copiedKeyframes
    ) {
      // Mantener los keyframes copiados en sus nuevas posiciones
      setAnimationData((prevData) => {
        const newData = { ...prevData };
        draggingKeyframe.copiedKeyframes?.forEach((ck) => {
          newData[ck.objectId][ck.property] = newData[ck.objectId][ck.property]
            .filter((k) => k.id !== ck.id.replace("copy-", ""))
            .sort((a, b) => a.frame - b.frame);
        });
        return newData;
      });
    }

    setDraggingKeyframe(null);
    if (regionSelection) {
      const selectedKeys = directories
        .flatMap((directory, dirIndex) => {
          const directoryTop = directories.slice(0, dirIndex).reduce(
            (acc, dir) =>
              acc +
              DIRECTORY_HEIGHT +
              dir.objects.reduce((objAcc, objId) => {
                const obj = objects.find((o) => o.id === objId);
                return (
                  objAcc +
                  (obj
                    ? collapsedObjects.has(obj.id)
                      ? OBJECT_HEIGHT
                      : OBJECT_HEIGHT +
                        Object.keys(obj.properties).length * PROPERTY_HEIGHT
                    : 0)
                );
              }, 0),
            0
          );

          return objects
            .filter((obj) => directory.objects.includes(obj.id))
            .flatMap((obj, objIndex) => {
              const objectTop = calculateObjectPosition(
                objects,
                objIndex,
                collapsedObjects,
                directory.objects
              );
              return Object.keys(obj.properties).flatMap(
                (property, propIndex) => {
                  const keyframes = animationData[obj.id]?.[property];
                  if (!keyframes) return [];
                  return keyframes
                    .filter((keyframe) => {
                      const keyframeX =
                        (keyframe.frame / totalFrames) *
                        timelineRef.current!.clientWidth;
                      const keyframeY =
                        directoryTop +
                        DIRECTORY_HEIGHT +
                        objectTop +
                        (propIndex * PROPERTY_HEIGHT + OBJECT_HEIGHT) +
                        PROPERTY_HEIGHT / 2;
                      return (
                        keyframeX >=
                          Math.min(
                            regionSelection.startX,
                            regionSelection.endX
                          ) &&
                        keyframeX <=
                          Math.max(
                            regionSelection.startX,
                            regionSelection.endX
                          ) &&
                        keyframeY >=
                          Math.min(
                            regionSelection.startY,
                            regionSelection.endY
                          ) &&
                        keyframeY <=
                          Math.max(regionSelection.startY, regionSelection.endY)
                      );
                    })
                    .map((keyframe) => ({
                      objectId: obj.id,
                      property,
                      keyframeId: keyframe.id,
                    }));
                }
              );
            });
        })
        .filter(Boolean);

      if (isCtrlPressed && isShiftPressed) {
        setSelectedKeyframes((prev) => {
          const newSelection = selectedKeys.filter(
            (newKey) =>
              !prev.some(
                (existingKey) =>
                  existingKey.objectId === newKey.objectId &&
                  existingKey.property === newKey.property &&
                  existingKey.keyframeId === newKey.keyframeId
              )
          );
          return [...prev, ...newSelection];
        });
      } else {
        setSelectedKeyframes(selectedKeys);
      }
    }
    if (!isCtrlPressed && !isShiftPressed) {
      setRegionSelection(null);
    }
  };

  const updateKeyframeValue = (field: string, value: number) => {
    if (selectedKeyframes.length > 0) {
      setAnimationData((prevData) => {
        const newData = { ...prevData };
        selectedKeyframes.forEach(({ objectId, property, keyframeId }) => {
          if (newData[objectId] && newData[objectId][property]) {
            newData[objectId][property] = newData[objectId][property].map(
              (keyframe) =>
                keyframe.id === keyframeId
                  ? {
                      ...keyframe,
                      value: field.startsWith("value.")
                        ? { ...keyframe.value, [field.split(".")[1]]: value }
                        : keyframe.value,
                      [field]: field.startsWith("value.")
                        ? keyframe[field as keyof Keyframe]
                        : value,
                    }
                  : keyframe
            );
          }
        });
        return newData;
      });
    }
  };

  const deleteSelectedKeyframes = useCallback(() => {
    if (selectedKeyframes.length === 0) return;

    setAnimationData((prevData) => {
      const newData = { ...prevData };
      selectedKeyframes.forEach(({ objectId, property, keyframeId }) => {
        if (newData[objectId] && newData[objectId][property]) {
          newData[objectId][property] = newData[objectId][property].filter(
            (keyframe) => keyframe.id !== keyframeId
          );
        }
      });
      return newData;
    });
    setSelectedKeyframes([]);
  }, [selectedKeyframes]);

  const invertSelectedKeyframes = useCallback(() => {
    if (selectedKeyframes.length <= 1) return;

    const sortedKeyframes = [...selectedKeyframes].sort((a, b) => {
      const frameA =
        animationData[a.objectId][a.property].find((k) => k.id === a.keyframeId)
          ?.frame || 0;
      const frameB =
        animationData[b.objectId][b.property].find((k) => k.id === b.keyframeId)
          ?.frame || 0;
      return frameA - frameB;
    });

    const newFrames = sortedKeyframes
      .map(
        (sk) =>
          animationData[sk.objectId][sk.property].find(
            (k) => k.id === sk.keyframeId
          )?.frame || 0
      )
      .reverse();

    setAnimationData((prevData) => {
      const newData = { ...prevData };
      sortedKeyframes.forEach((sk, index) => {
        const keyframeIndex = newData[sk.objectId][sk.property].findIndex(
          (k) => k.id === sk.keyframeId
        );
        if (keyframeIndex !== -1) {
          newData[sk.objectId][sk.property][keyframeIndex] = {
            ...newData[sk.objectId][sk.property][keyframeIndex],
            frame: newFrames[index],
          };
        }
      });
      // Sort keyframes after updating
      Object.keys(newData).forEach((objId) => {
        Object.keys(newData[objId]).forEach((prop) => {
          newData[objId][prop].sort((a, b) => a.frame - b.frame);
        });
      });
      return newData;
    });
  }, [animationData, selectedKeyframes]);

  const toggleObjectCollapse = (objectId: string) => {
    setCollapsedObjects((prevCollapsed) => {
      const newCollapsed = new Set(prevCollapsed);
      if (newCollapsed.has(objectId)) {
        newCollapsed.delete(objectId);
      } else {
        newCollapsed.add(objectId);
      }
      return newCollapsed;
    });
  };

  const handleDragProperty = (
    sourceObjectId: string,
    targetObjectId: string,
    property: string,
    keepSource: boolean
  ) => {
    addToUndoStack(animationData);

    setAnimationData((prevData) => {
      const newData = { ...prevData };

      // Copiar los keyframes de la propiedad de origen al objeto de destino
      if (newData[sourceObjectId] && newData[sourceObjectId][property]) {
        if (!newData[targetObjectId]) {
          newData[targetObjectId] = {};
        }
        newData[targetObjectId][property] = [
          ...newData[sourceObjectId][property],
        ];
      }

      // Si no se mantiene la fuente, eliminar la propiedad del objeto de origen
      if (!keepSource) {
        delete newData[sourceObjectId][property];
        if (Object.keys(newData[sourceObjectId]).length === 0) {
          delete newData[sourceObjectId];
        }
      }

      return newData;
    });

    // Actualizar los objetos
    setObjects((prevObjects) => {
      const newObjects = prevObjects.map((obj) => {
        if (obj.id === targetObjectId) {
          const sourceObject = prevObjects.find((o) => o.id === sourceObjectId);
          return {
            ...obj,
            properties: {
              ...obj.properties,
              [property]: sourceObject
                ? { ...sourceObject.properties[property] }
                : { x: 0, y: 0, z: 0 },
            },
          };
        }
        if (obj.id === sourceObjectId && !keepSource) {
          const { [property]: _, ...restProperties } = obj.properties;
          return { ...obj, properties: restProperties };
        }
        return obj;
      });
      return newObjects;
    });
  };

  const moveObjectToDirectory = (
    objectId: string,
    targetDirectoryId: string
  ) => {
    setDirectories((prevDirs) => {
      const newDirs = prevDirs.map((dir) => {
        if (dir.id === targetDirectoryId) {
          return { ...dir, objects: [...dir.objects, objectId] };
        } else {
          return {
            ...dir,
            objects: dir.objects.filter((id) => id !== objectId),
          };
        }
      });
      return newDirs;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
      if (e.key === "Control") {
        setIsCtrlPressed(true);
      }
      if (e.key === "Delete") {
        deleteSelectedKeyframes();
      }
      if (e.key === "r" && e.ctrlKey) {
        e.preventDefault();
        invertSelectedKeyframes();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
        if (!isCtrlPressed) {
          setRegionSelection(null);
        }
      }
      if (e.key === "Control") {
        setIsCtrlPressed(false);
        if (!isShiftPressed) {
          setRegionSelection(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    isCtrlPressed,
    isShiftPressed,
    deleteSelectedKeyframes,
    invertSelectedKeyframes,
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (
        timelineRef.current &&
        e.buttons === 1 &&
        !draggingKeyframe &&
        !isShiftPressed &&
        !isCtrlPressed
      ) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const frame = Math.round((x / rect.width) * totalFrames);
        setCurrentFrame(Math.max(0, Math.min(frame, totalFrames)));
      }
    };

    const timeline = timelineRef.current;
    if (timeline) {
      timeline.addEventListener("mousemove", handleMouseMove);
      timeline.addEventListener("mousedown", handleMouseMove);
    }

    return () => {
      if (timeline) {
        timeline.removeEventListener("mousemove", handleMouseMove);
        timeline.removeEventListener("mousedown", handleMouseMove);
      }
    };
  }, [totalFrames, draggingKeyframe, isShiftPressed, isCtrlPressed]);

  const renderKeyframeLines = useMemo(
    () => (objectId: string, property: string, keyframes: Keyframe[]) => {
      return keyframes.map((keyframe, index) => {
        const lines = [];

        if (index > 0) {
          const prevKeyframe = keyframes[index - 1];
          if (
            JSON.stringify(keyframe.value) !==
            JSON.stringify(prevKeyframe.value)
          ) {
            const x1 = (prevKeyframe.frame / totalFrames) * 100;
            const x2 = (keyframe.frame / totalFrames) * 100;
            lines.push(
              <line
                key={`${prevKeyframe.id}-${keyframe.id}`}
                x1={`${x1}%`}
                y1="50%"
                x2={`${x2}%`}
                y2="50%"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
              />
            );
          }
        }

        if (index < keyframes.length - 1) {
          const nextKeyframe = keyframes[index + 1];
          if (
            JSON.stringify(keyframe.value) !==
            JSON.stringify(nextKeyframe.value)
          ) {
            const x1 = (keyframe.frame / totalFrames) * 100;
            const x2 = (nextKeyframe.frame / totalFrames) * 100;
            lines.push(
              <line
                key={`${keyframe.id}-${nextKeyframe.id}`}
                x1={`${x1}%`}
                y1="50%"
                x2={`${x2}%`}
                y2="50%"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
              />
            );
          }
        }

        return lines;
      });
    },
    [totalFrames]
  );

  const handleDirectoryChange = (directoryId: string) => {
    setCurrentDirectoryId(directoryId);
  };

  const handleAllToggle = (checked: boolean) => {
    setShowAll(checked);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition({
      x: target.scrollLeft,
      y: target.scrollTop,
    });
  };

  const handleSetTotalFrames = (frames: number) => {
    setTotalFrames(frames);
  };

  return (
    <div className="animation-timeline-editor">
      <TopMenu
        directories={directories}
        currentDirectoryId={currentDirectoryId}
        showAll={showAll}
        onDirectoryChange={handleDirectoryChange}
        onAllToggle={handleAllToggle}
        onAddObject={addObject}
        onAddDirectory={addDirectory}
        onUndo={undo}
        onRedo={redo}
      />
      <div className="animation-timeline-content">
        <ObjectPanel
          objects={objects}
          directories={directories}
          collapsedObjects={collapsedObjects}
          onToggleCollapse={toggleObjectCollapse}
          onDragProperty={handleDragProperty}
          onMoveObjectToDirectory={moveObjectToDirectory}
        />
        <div className="timeline-container">
          <div className="timeline-content" onScroll={handleScroll}>
            <div
              ref={timelineRef}
              className="relative bg-gray-100 cursor-pointer"
              style={{
                width: `${(totalFrames / visibleFrames) * 100}%`,
                height: `100%`,
              }}
              onMouseDown={handleTimelineMouseDown}
              onMouseMove={handleTimelineMouseMove}
              onMouseUp={handleTimelineMouseUp}
              onMouseLeave={handleTimelineMouseUp}
            >
              {/* Grid lines and frame numbers */}
              {Array.from({
                length: Math.floor(totalFrames / gridSpacing) + 1,
              }).map((_, i) => (
                <React.Fragment key={i}>
                  <div
                    className="absolute top-0 bottom-0 w-px bg-gray-300"
                    style={{
                      left: `${((i * gridSpacing) / totalFrames) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-0 text-xs text-gray-500 select-none"
                    style={{
                      left: `${((i * gridSpacing) / totalFrames) * 100}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {i * gridSpacing}
                  </div>
                </React.Fragment>
              ))}
              {/* Current frame indicator */}
              <div
                className="current-frame-indicator"
                style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
              />
              {/* Region selection */}
              {regionSelection && (
                <div
                  className="absolute bg-blue-200 opacity-50 border-2 border-blue-500"
                  style={{
                    left: `${Math.min(
                      regionSelection.startX,
                      regionSelection.endX
                    )}px`,
                    top: `${Math.min(
                      regionSelection.startY,
                      regionSelection.endY
                    )}px`,
                    width: `${Math.abs(
                      regionSelection.endX - regionSelection.startX
                    )}px`,
                    height: `${Math.abs(
                      regionSelection.endY - regionSelection.startY
                    )}px`,
                  }}
                />
              )}
              {/* Directories, objects, and keyframes */}
              {directories.map((directory, dirIndex) => {
                const directoryTop = directories.slice(0, dirIndex).reduce(
                  (acc, dir) =>
                    acc +
                    DIRECTORY_HEIGHT +
                    dir.objects.reduce((objAcc, objId) => {
                      const obj = objects.find((o) => o.id === objId);
                      return (
                        objAcc +
                        (obj
                          ? collapsedObjects.has(obj.id)
                            ? OBJECT_HEIGHT
                            : OBJECT_HEIGHT +
                              Object.keys(obj.properties).length *
                                PROPERTY_HEIGHT
                          : 0)
                      );
                    }, 0),
                  0
                );

                const directoryObjects = objects.filter((obj) =>
                  directory.objects.includes(obj.id)
                );
                const directoryHeight =
                  DIRECTORY_HEIGHT +
                  directoryObjects.reduce(
                    (acc, obj) =>
                      acc +
                      (collapsedObjects.has(obj.id)
                        ? OBJECT_HEIGHT
                        : OBJECT_HEIGHT +
                          Object.keys(obj.properties).length * PROPERTY_HEIGHT),
                    0
                  );

                return (
                  <div
                    key={directory.id}
                    className="absolute left-0 right-0"
                    style={{
                      top: `${directoryTop}px`,
                      height: `${directoryHeight}px`,
                    }}
                  >
                    {/* Directory bar */}
                    <div
                      className="absolute h-2 bg-purple-500"
                      style={{
                        left: `${
                          (directory.currentFrame / totalFrames) * 100
                        }%`,
                        width: `${
                          ((getLastKeyframeFrame() - directory.currentFrame) /
                            totalFrames) *
                          100
                        }%`,
                        top: "0",
                        height: `${DIRECTORY_HEIGHT}px`,
                      }}
                    >
                      <span className="absolute left-2 top-1 text-xs text-white">
                        {directory.name}
                      </span>
                    </div>
                    {/* Objects and keyframes */}
                    {objects
                      .filter((obj) => directory.objects.includes(obj.id))
                      .map((obj, objIndex) => {
                        const objectTop = calculateObjectPosition(
                          objects,
                          objIndex,
                          collapsedObjects,
                          directory.objects
                        );
                        const { start, end } = calculateObjectDuration(obj.id);
                        const isCollapsed = collapsedObjects.has(obj.id);
                        const objectHeight = isCollapsed
                          ? OBJECT_HEIGHT
                          : OBJECT_HEIGHT +
                            Object.keys(obj.properties).length *
                              PROPERTY_HEIGHT;

                        return (
                          <div
                            key={obj.id}
                            className="absolute left-0 right-0"
                            style={{
                              top: `${objectTop + DIRECTORY_HEIGHT}px`,
                              height: `${objectHeight}px`,
                            }}
                          >
                            {/* Object duration bar */}
                            <div
                              className="absolute bg-gray-300 cursor-move"
                              style={{
                                left: `${(start / totalFrames) * 100}%`,
                                width: `${
                                  ((end - start) / totalFrames) * 100
                                }%`,
                                height: "8px",
                                top: `${OBJECT_HEIGHT / 2 - 4}px`,
                              }}
                              onMouseDown={(e) =>
                                handleObjectBarMouseDown(obj.id, e, "middle")
                              }
                            >
                              {/* Left handle */}
                              <div
                                className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize"
                                onMouseDown={(e) =>
                                  handleObjectBarMouseDown(obj.id, e, "left")
                                }
                              />
                              {/* Right handle */}
                              <div
                                className="absolute right-0 top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize"
                                onMouseDown={(e) =>
                                  handleObjectBarMouseDown(obj.id, e, "right")
                                }
                              />
                            </div>
                            {!isCollapsed &&
                              Object.keys(obj.properties).map(
                                (property, propIndex) => (
                                  <div
                                    key={`${obj.id}-${property}`}
                                    className="absolute left-0 right-0"
                                    style={{
                                      top: `${
                                        propIndex * PROPERTY_HEIGHT +
                                        OBJECT_HEIGHT
                                      }px`,
                                      height: `${PROPERTY_HEIGHT}px`,
                                    }}
                                  >
                                    <svg className="absolute inset-0 w-full h-full">
                                      {renderKeyframeLines(
                                        obj.id,
                                        property,
                                        animationData[obj.id]?.[property] || []
                                      )}
                                    </svg>
                                    {animationData[obj.id]?.[property]?.map(
                                      (keyframe) => {
                                        const isSelected =
                                          selectedKeyframes.some(
                                            (sk) =>
                                              sk.objectId === obj.id &&
                                              sk.property === property &&
                                              sk.keyframeId === keyframe.id
                                          );
                                        const isLastSelected =
                                          selectedKeyframes.length > 0 &&
                                          selectedKeyframes[
                                            selectedKeyframes.length - 1
                                          ].objectId === obj.id &&
                                          selectedKeyframes[
                                            selectedKeyframes.length - 1
                                          ].property === property &&
                                          selectedKeyframes[
                                            selectedKeyframes.length - 1
                                          ].keyframeId === keyframe.id;
                                        return (
                                          <div
                                            key={keyframe.id}
                                            className={`absolute w-3 h-3 cursor-move ${
                                              isLastSelected
                                                ? "bg-yellow-500"
                                                : isSelected
                                                ? "bg-yellow-300"
                                                : "bg-blue-500"
                                            }`}
                                            style={{
                                              left: `${
                                                (keyframe.frame / totalFrames) *
                                                100
                                              }%`,
                                              top: "50%",
                                              transform:
                                                "translate(-50%, -50%)",
                                            }}
                                            onMouseDown={handleKeyframeMouseDown(
                                              obj.id,
                                              property,
                                              keyframe.id
                                            )}
                                          />
                                        );
                                      }
                                    )}
                                  </div>
                                )
                              )}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="keyframe-panel">
          <KeyframeEditor
            selectedKeyframes={selectedKeyframes}
            animationData={animationData}
            updateKeyframeValue={updateKeyframeValue}
          />
          <div className="keyframe-values">
            <h3 className="keyframe-values-title">Keyframe Values</h3>{" "}
            {selectedKeyframes.length > 0 ? (
              selectedKeyframes.map(({ objectId, property, keyframeId }) => {
                const keyframe = animationData[objectId]?.[property]?.find(
                  (k) => k.id === keyframeId
                );
                return keyframe ? (
                  <div key={keyframeId} className="mb-2">
                    <p className="font-medium">{`${objectId} - ${property}`}</p>
                    <p>{`Frame: ${keyframe.frame}`}</p>
                    <p>{`Value: (${keyframe.value.x}, ${keyframe.value.y}, ${keyframe.value.z})`}</p>
                    <p>{`Angle: ${keyframe.angle}`}</p>
                    <p>{`Weight: ${keyframe.weight}`}</p>
                  </div>
                ) : null;
              })
            ) : (
              <p className="text-gray-500">No keyframe selected</p>
            )}
          </div>
        </div>
      </div>
      <PlaybackControls
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        isPlaying={isPlaying}
        gridSpacing={gridSpacing}
        selectedProperty={selectedProperty}
        onSetCurrentFrame={setCurrentFrame}
        onTogglePlay={togglePlay}
        onSetGridSpacing={setGridSpacing}
        onAddKeyframe={addKeyframe}
        onSetTotalFrames={handleSetTotalFrames}
      />
    </div>
  );
}
