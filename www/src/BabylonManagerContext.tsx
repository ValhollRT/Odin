import React from 'react';
import { type BabylonManager } from './Engine/Geometry/BabylonManager';

export const BabylonManagerContext = React.createContext<{
  babylonManager: BabylonManager | null;
  isReady: boolean;
}>({
  babylonManager: null,
  isReady: false
});
