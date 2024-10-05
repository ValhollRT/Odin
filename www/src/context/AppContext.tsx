import { type Scene } from 'babylonjs';
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode
} from 'react';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [geometries, setGeometries] = useState<Geometry[]>([]);
  const [selectedGeometries, setSelectedGeometries] = useState<number[]>([]);

  return (
    <AppContext.Provider
      value={{
        scene,
        setScene,
        geometries,
        setGeometries,
        selectedGeometries,
        setSelectedGeometries
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
