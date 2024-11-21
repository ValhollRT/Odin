import { Mesh, type Scene } from "@babylonjs/core";
import React, { createContext, useContext, useState, type ReactNode } from "react";
import { AnimationData, Object3D, SelectedProperty } from "../components/timeline/interfaces";

export type IconType = "group" | "geometry" | "text" | "image" | "video" | "audio";

export interface Container {
  id: string;
  color?: string;
  name: string;
  isExpanded?: boolean;
  meshId?: string;
  icons: IconType[];
  visible: boolean;
  locked: boolean;
  children: Container[];
}
interface AppContextType {
  scene: Scene | null;
  setScene: (scene: Scene | null) => void;
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  meshes: Mesh[];
  setMeshes: React.Dispatch<React.SetStateAction<Mesh[]>>;
  selectedGeometries: string[];
  setSelectedGeometries: React.Dispatch<React.SetStateAction<string[]>>;
  objects: Object3D[];
  setObjects: React.Dispatch<React.SetStateAction<Object3D[]>>;
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
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedGeometries, setSelectedGeometries] = useState<string[]>([]);
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
        containers,
        setContainers,
        meshes,
        setMeshes,
        selectedGeometries,
        setSelectedGeometries,
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
