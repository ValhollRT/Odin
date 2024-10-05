import { useEffect, useRef } from "react";
import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color3,
} from "@babylonjs/core";
import GeometryCreator from "./GeometryCreator";
import GeometryDropZone from "./GeometryDropZone";
import { useAppContext } from "../context/AppContext";
import EmptyComponent from "./EmptyComponent";
import { GridMaterial } from "@babylonjs/materials";

export default function MainWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setScene } = useAppContext();

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new Engine(canvasRef.current, true);
      const newScene = new Scene(engine);

      // Cámara
      const camera = new FreeCamera(
        "camera1",
        new Vector3(0, 50, -50),
        newScene
      );
      camera.setTarget(new Vector3(0, 0, 20));
      camera.attachControl(canvasRef.current, true);

      // Luz
      const light = new HemisphericLight(
        "light1",
        new Vector3(0, 1, 0),
        newScene
      );
      light.groundColor = new Color3(0.5, 0.5, 0.5);
      light.intensity = 0.2;

      // Material del suelo (grid)
      const groundMaterial = new GridMaterial("groundMaterial", newScene);
      groundMaterial.majorUnitFrequency = 5;
      groundMaterial.minorUnitVisibility = 0.45;
      groundMaterial.gridRatio = 1;
      groundMaterial.backFaceCulling = false;
      groundMaterial.mainColor = new Color3(1, 1, 1);
      groundMaterial.lineColor = new Color3(1.0, 1.0, 1.0);
      groundMaterial.opacity = 0.98;

      // Suelo
      const ground = MeshBuilder.CreateGround(
        "ground1",
        { width: 200, height: 200, subdivisions: 2 },
        newScene
      );
      ground.material = groundMaterial;

      engine.runRenderLoop(() => {
        newScene.render();
      });

      const resizeHandler = () => {
        engine.resize();
      };

      window.addEventListener("resize", resizeHandler);

      setScene(newScene);

      return () => {
        window.removeEventListener("resize", resizeHandler);
        engine.dispose();
      };
    }
  }, [setScene]);

  return (
    <div className="main-window">
      <div className="component">
        <GeometryCreator />
      </div>
      <div className="component">
        <EmptyComponent title="Component 2" />
      </div>
        <GeometryDropZone />
        <div className="canvas-container component-viewport">
          <canvas ref={canvasRef} />
        </div>
    </div>
  );
}
