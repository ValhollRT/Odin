import { ArcRotateCamera, Color4, Engine, GizmoManager, LightGizmo, Mesh, Scene, Vector3 } from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import { Grid } from "../../engine/Grid";

export const Viewport = () => {
  const { selectedNodes: selectedContainers, setSelectedNodes: setSelectedContainers, meshes } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gizmoManagerRef = useRef<GizmoManager | null>(null);
  const { setScene } = useAppContext();

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new Engine(canvasRef.current, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        alpha: true,
        antialias: true,
      });

      engine.setSize(1445, 813);

      const scene = new Scene(engine);
      scene.autoClearDepthAndStencil = true; // Depth and stencil, obviously
      scene.clearColor = new Color4(0.2, 0.2, 0.2, 1);
      scene.registerAfterRender(() => {});

      const grid = new Grid(scene);

      const camera = new ArcRotateCamera("camera", 0, 0, 0, Vector3.Zero(), scene);
      camera.position = new Vector3(50, 50, -50);
      camera.setTarget(Vector3.Zero());
      camera.panningSensibility = 100;
      scene.activeCamera = camera;

      //LightGizmo
      const lightGizmo = new LightGizmo();

      // Initialize GizmoManager
      const gizmoManager = new GizmoManager(scene);
      gizmoManager.boundingBoxGizmoEnabled = true;
      gizmoManager.clearGizmoOnEmptyPointerEvent = true;
      //Trick to keep gizmo selected while orbiting viewport
      gizmoManager.usePointerToAttachGizmos = false;


      // Event listeners
      const handlePointerDown = (ev: PointerEvent) => {
        const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
        console.log("handlePointerDown", pickInfo)
        if (pickInfo.hit) {
          // ... (lógica para obtener el objeto seleccionado) ...
          //setSelectedObject(selectedObject);
          // ... (actualizar gizmoManager con el objeto seleccionado) ...
          //gizmoManagerRef.current?.attachToNode(selectedObject.getPlugTransform());
        } else {
          //setSelectedObject(null);
          gizmoManagerRef.current?.attachToNode(null);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        // ... (lógica para manejar teclas, similar al código Angular) ...
        // if (ev.key === 'f' && selectedObject) {
        // const pMesh = selectedObject.getPlugTransform().getAbsolutePosition();
        // camera.setTarget(new Vector3(pMesh.x, pMesh.y, pMesh.z));
        // }
        // ... (lógica para activar/desactivar Gizmos) ...

        console.log(e.key);
        if (e.key === "w") {
          gizmoManager.positionGizmoEnabled = !gizmoManager.positionGizmoEnabled;
          gizmoManager.gizmos.positionGizmo!.snapDistance = 0.001;
          gizmoManager.rotationGizmoEnabled = false;
          gizmoManager.scaleGizmoEnabled = false;
          gizmoManager.boundingBoxGizmoEnabled = false;
        }
        if (e.key === "e") {
          gizmoManager.positionGizmoEnabled = false;
          gizmoManager.rotationGizmoEnabled = !gizmoManager.rotationGizmoEnabled;
          gizmoManager.gizmos.rotationGizmo!.snapDistance = 0.001;
          gizmoManager.scaleGizmoEnabled = false;
          gizmoManager.boundingBoxGizmoEnabled = false;
        }
        if (e.key === "r") {
          gizmoManager.positionGizmoEnabled = false;
          gizmoManager.rotationGizmoEnabled = false;
          gizmoManager.scaleGizmoEnabled = !gizmoManager.scaleGizmoEnabled;
          gizmoManager.gizmos.scaleGizmo!.snapDistance = 0.001;
          gizmoManager.boundingBoxGizmoEnabled = false;
        }
        if (e.key === "q") {
          gizmoManager.positionGizmoEnabled = false;
          gizmoManager.rotationGizmoEnabled = false;
          gizmoManager.scaleGizmoEnabled = false;
        }
        if (e.key === "t") {
          gizmoManager.gizmos.positionGizmo!.updateGizmoPositionToMatchAttachedMesh =
            !gizmoManager.gizmos.positionGizmo!.updateGizmoPositionToMatchAttachedMesh;
          gizmoManager.gizmos.positionGizmo!.updateGizmoRotationToMatchAttachedMesh =
            !gizmoManager.gizmos.positionGizmo!.updateGizmoRotationToMatchAttachedMesh;
          gizmoManager.gizmos.positionGizmo!.updateScale = true;
        }
        if (e.key === "Alt") {
          camera.attachControl(canvasRef.current, true, true);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === "Alt") {
          // lockGizmoTransform = false;
          camera.detachControl();
        }
      };

      engine.runRenderLoop(() => {
        scene.render();
      });

      const resizeHandler = () => {
        engine.resize();
      };

      window.addEventListener("resize", resizeHandler);
      canvasRef.current.addEventListener("pointerdown", handlePointerDown);
      canvasRef.current.addEventListener("keydown", handleKeyDown);

      setScene(scene);

      gizmoManagerRef.current = gizmoManager;

      return () => {
        canvasRef.current?.removeEventListener("pointerdown", handlePointerDown);
        canvasRef.current?.removeEventListener("keydown", handleKeyDown);
        gizmoManagerRef.current?.dispose();
        window.removeEventListener("resize", resizeHandler);
        engine.dispose();
      };
    }
  }, [setScene]);

  useEffect(() => {
    let selectedMesh = meshes.filter(m => m.id === selectedContainers[0])[0];
      console.log("selectedMesh", selectedMesh)
      gizmoManagerRef.current?.attachToMesh(selectedMesh);
  },[selectedContainers]);

  return <canvas ref={canvasRef} />;
};
