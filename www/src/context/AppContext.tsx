import { Mesh, type Scene } from "@babylonjs/core";
import React, { createContext, useContext, useState, type ReactNode } from "react";
import { AnimationData, Object3D, SelectedProperty } from "../components/timeline/interfaces";
import { TreeNode } from "../components/sceneTree/sceneTree";


interface AppContextType {
  scene: Scene | null;
  setScene: (scene: Scene | null) => void;
  nodes: TreeNode[];
  setNodes: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  meshes: Mesh[];
  setMeshes: React.Dispatch<React.SetStateAction<Mesh[]>>;
  selectedNodes: string[];
  setSelectedNodes: React.Dispatch<React.SetStateAction<string[]>>;
  objects: Object3D[];
  setObjects: React.Dispatch<React.SetStateAction<Object3D[]>>; // Replace used in timeline
  animationData: AnimationData;
  setAnimationData: React.Dispatch<React.SetStateAction<AnimationData>>;
  selectedProperty: SelectedProperty | null;
  setSelectedProperty: React.Dispatch<React.SetStateAction<SelectedProperty | null>>;
  addProperty: (selectedProperty: SelectedProperty) => void;
  removeProperty: (selectedProperty: SelectedProperty) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // General App
  const [scene, setScene] = useState<Scene | null>(null);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [meshes, setMeshes] = useState<Mesh[]>([]);

  // Timeline
  const [objects, setObjects] = useState<Object3D[]>([]);
  const [animationData, setAnimationData] = useState<AnimationData>({});
  const [selectedProperty, setSelectedProperty] = useState<SelectedProperty | null>(null);

  const addProperty = (selectedProperty: SelectedProperty) => {
    setObjects(
      objects.map((obj) => {
        if (obj.id === selectedProperty.objectId) {
          return {
            ...obj,
            properties: {
              ...obj.properties,
              [selectedProperty.property]:
                selectedProperty.property === "scale" ? { x: 1, y: 1, z: 1 } : { x: 0, y: 0, z: 0 },
            },
          };
        }
        return obj;
      })
    );
  };

  const removeProperty = (selectedProperty: SelectedProperty) => {
    setObjects(
      objects.map((obj) => {
        if (obj.id === selectedProperty.objectId) {
          const { [selectedProperty.property]: _, ...restProperties } = obj.properties;
          return { ...obj, properties: restProperties };
        }
        return obj;
      })
    );
    if (
      selectedProperty?.objectId === selectedProperty.objectId &&
      selectedProperty?.property === selectedProperty.property
    ) {
      setSelectedProperty(null);
    }

    setAnimationData((prevData) => {
      const { [selectedProperty.objectId]: objectData, ...restData } = prevData;
      if (objectData) {
        const { [selectedProperty.property]: _, ...restProperties } = objectData;
        return { ...restData, [selectedProperty.objectId]: restProperties };
      }
      return restData;
    });
  };

  return (
    <AppContext.Provider
      value={{
        scene,
        setScene,
        nodes: nodes,
        setNodes: setNodes,
        meshes,
        setMeshes,
        selectedNodes: selectedNodes,
        setSelectedNodes: setSelectedNodes,
        objects,
        setObjects,
        addProperty,
        removeProperty,
        animationData,
        setAnimationData,
        selectedProperty,
        setSelectedProperty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
