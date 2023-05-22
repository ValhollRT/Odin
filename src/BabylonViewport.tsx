import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, Color3, StandardMaterial } from 'babylonjs';

const BabylonViewport: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    const box = MeshBuilder.CreateBox('box', { size: 1 }, scene);
    box.position.y = 0.5;
    box.material = new StandardMaterial('boxMat', scene);
    (box.material as StandardMaterial).diffuseColor = new Color3(0.5, 0.5, 1);

    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      engine.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default BabylonViewport;