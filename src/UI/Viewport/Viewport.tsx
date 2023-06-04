import React, { useEffect, useMemo, useRef, useState } from 'react';
import GeometryButton from '../Buttons/GeomtryButtons';
import { GeometryType } from '../../Engine/Geometry/GeometryType';
import { GeometryFactory } from '../../Engine/Geometry/GeometryFactory';
import { BabylonManager } from '../../Engine/Geometry/BabylonManager';

function Viewport() {
  const canvasRef = useRef(null);
  const [geometryFactory, setGeometryFactory] = useState<GeometryFactory | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const babylonManager = BabylonManager.getInstance(canvasRef.current);
      setGeometryFactory(new GeometryFactory(babylonManager.scene));
      
      return () => {
        babylonManager.dispose();
      };
    }
  }, []);

  const geometryCreationFunctions = useMemo(() => {
    if (geometryFactory) {
      return {
        [GeometryType.Sphere]: geometryFactory.createSphere.bind(geometryFactory),
        [GeometryType.Box]: geometryFactory.createBox.bind(geometryFactory),
      };
    }
  }, [geometryFactory]);

  return (
    <div>
      <canvas ref={canvasRef} id="renderCanvas" style={{ width: '100%', height: '100%' }} />
      {geometryCreationFunctions && Object.keys(GeometryType)
        .filter(k => isNaN(Number(k)))
        .map(key => {
          const geometryType = GeometryType[key as keyof typeof GeometryType];
          return (
            <GeometryButton
              key={geometryType}
              createGeometry={geometryCreationFunctions[geometryType]}
              label={`Add ${GeometryType[geometryType]}`} 
            />
          );
        })}
    </div>
  );
}

export default Viewport;
