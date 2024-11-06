import { type Scene } from "@babylonjs/core";
import React, { createContext, useContext, useState, type ReactNode } from "react";
import { AnimationData, Object3D, SelectedProperty } from "../components/timeline/interfaces";

export interface Geometry {
  id: number;
  type: string;
  color?: string;
  meshName: string;
  parentId?: number;
  children: number[];
  isExpanded: boolean;
}

interface AppContextType {
  scene: Scene | null;
  setScene: (scene: Scene | null) => void;
  geometries: Geometry[];
  setGeometries: React.Dispatch<React.SetStateAction<Geometry[]>>;
  selectedGeometries: number[];
  setSelectedGeometries: React.Dispatch<React.SetStateAction<number[]>>;
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
  const [geometries, setGeometries] = useState<Geometry[]>([]);
  const [selectedGeometries, setSelectedGeometries] = useState<number[]>([]);

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
        geometries,
        setGeometries,
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
