export interface Object3D {
  id: string;
  name: string;
  properties: {
    [key: string]: { x: number; y: number; z: number };
  };
}

export interface Keyframe {
  id: string;
  frame: number;
  value: { x: number; y: number; z: number };
  angle: number;
  weight: number;
  property?: any;
  objectId?: any;
}

export interface AnimationData {
  [objectId: string]: {
    [property: string]: Keyframe[];
  };
}

export interface Directory {
  id: string;
  name: string;
  objects: string[];
  currentFrame: number;
}

export interface RegionSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface SelectedKeyframe {
  objectId: string;
  property: string;
  keyframeId: string;
  isCopy?: boolean;
  copiedKeyframes?: Keyframe[];
}
