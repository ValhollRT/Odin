// Viewport.tsx
import React, { useEffect, useRef, useState, useContext } from 'react';
import { BabylonManager } from '../../Engine/Geometry/BabylonManager';
// Viewport.tsx

interface ViewportProps {
  onReady: (manager: BabylonManager) => void;
}

function Viewport({ onReady }: ViewportProps) {
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("...Viewport");
    if (canvasRef.current) {
      console.log("Cargado Viewport", canvasRef.current);
      const manager = BabylonManager.getInstance(canvasRef.current);
      onReady(manager); // Llamamos a onReady y pasamos el manager
      return () => {
        manager.dispose();
      };
    }else{
      console.log("No se ha cargado el canvasRef");
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} id="renderCanvas" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default Viewport;