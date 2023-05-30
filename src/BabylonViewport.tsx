// BabylonViewport.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3, Mesh } from 'babylonjs';

function BabylonViewport() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [addSphere, setAddSphere] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!canvasRef.current)
      return;
    const canvas = canvasRef.current;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    setAddSphere(() => () => {
      const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 0.5 }, scene);
      sphere.position.y = 0;
      sphere.position.x = Math.random();
      sphere.position.z = Math.random();
      sphere.material = new StandardMaterial('boxMat', scene);
      (sphere.material as StandardMaterial).diffuseColor = new Color3(Math.random(), Math.random(), Math.random());
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      engine.dispose();
    };
  }, []);

  return { addSphere, canvasRef };
}

export default BabylonViewport;
