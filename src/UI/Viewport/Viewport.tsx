import React, { useEffect, useRef } from 'react';
import { BabylonManager } from '../../Engine/Geometry/BabylonManager';
import log from '../../logConfig';
import '../../styles/styles.scss';

interface ViewportProps {
  onReady: (manager: BabylonManager) => void;
}

function Viewport({ onReady }: ViewportProps): React.ReactElement {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      log.debug('Cargado Viewport', canvasRef.current);
      const manager = BabylonManager.getInstance(canvasRef.current);
      onReady(manager);
      return () => {
        manager.dispose();
      };
    } else {
      log.debug('No se ha cargado el canvasRef');
    }
  }, []);

  return (
    <div className="viewport">
      <canvas
        ref={canvasRef}
        id="renderCanvas"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default Viewport;
