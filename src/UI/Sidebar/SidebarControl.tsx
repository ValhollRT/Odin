// SidebarControl.tsx
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Browser from './Browser';
import TreeNode from './TreeNode';
import { GeometryFactory } from '../../Engine/Geometry/GeometryFactory';
import { GeometryType } from '../../Engine/Geometry/GeometryType';
import { BabylonManagerContext } from '../../BabylonManagerContext';  // Importa el contexto


function SidebarControl() {
  const [geometryFactory, setGeometryFactory] = useState<GeometryFactory | null>(null);
  const { babylonManager, isReady } = useContext(BabylonManagerContext);


  useEffect(() => {
    if (babylonManager) {
      const newGeometryFactory = new GeometryFactory(babylonManager.scene);
      setGeometryFactory(newGeometryFactory);
    } else {
      console.log("BabylonManager is not loaded");
    }
  }, [babylonManager, isReady]);

  let createGeometryFn;
  if (geometryFactory) {
    createGeometryFn = {
      createGeometry: geometryFactory.createGeometry.bind(geometryFactory)
    };
  }

  return (
    <div>
      {isReady ? <Browser createGeometryFn={createGeometryFn} /> : 'Loading...'}
      <TreeNode />
    </div>
  );
}

export default SidebarControl;
