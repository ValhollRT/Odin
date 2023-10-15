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
    console.log("...SidebarControl", babylonManager);

    if (babylonManager) {
      const newGeometryFactory = new GeometryFactory(babylonManager.scene);
      setGeometryFactory(newGeometryFactory);
      console.log("Cargado SidebarControl");

    } else {
      console.log("No se ha cargado el babylonManager");
    }
  }, [babylonManager, isReady]);

  let geometryCreationFunctions;

  if (geometryFactory) {
    console.log('Entrando al bloque donde geometryFactory existe.');
    geometryCreationFunctions = {
      [GeometryType.Sphere]: geometryFactory.createSphere.bind(geometryFactory),
      [GeometryType.Box]: geometryFactory.createBox.bind(geometryFactory),
    };
  }

  console.log("geometryCreationFunctions", geometryCreationFunctions)
  return (
    <div>
      {isReady ? <Browser geometryCreationFunctions={geometryCreationFunctions} /> : 'Cargando...'}
      <TreeNode />
    </div>
  );
}


export default SidebarControl;
