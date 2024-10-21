export interface OdinContainer {
    id: number;
    type: 'mesh' | 'light' | 'camera' | 'transformNode' ;
    objectId: number | null;
    materialId: number | null;
  }