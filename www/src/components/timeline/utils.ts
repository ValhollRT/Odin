import { Object3D } from "./interfaces";

export const TRACK_HEIGHT = 30;
export const INITIAL_GRID_SPACING = 10;
export const ICON_UI_SIZE = 18;

export const calculateObjectPosition = (
  objects: Object3D[],
  currentIndex: number,
  collapsedObjects: Set<string>,
  directoryObjects: string[]
): number => {
  if (currentIndex === 0) return 0;

  let totalHeight = 0;
  for (let i = 0; i < currentIndex; i++) {
    const objId = directoryObjects[i];
    const obj = objects.find((o) => o.id === objId);
    if (obj) {
      if (collapsedObjects.has(obj.id)) {
        totalHeight += TRACK_HEIGHT;
      } else {
        totalHeight += TRACK_HEIGHT + Object.keys(obj.properties).length * TRACK_HEIGHT;
      }
    }
  }
  return totalHeight;
};

export const interpolateValue = (start: number, end: number, fraction: number): number => {
  return start + (end - start) * fraction;
};
