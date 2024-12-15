import GeometryCreator from "./GeometryCreator";
import { SceneTree } from "./sceneTree/sceneTree";
import TransformPanel from "./transformPanel/TransformPanel";
import { Viewport } from "./viewport/Viewport";

export default function MainWindow() {
  return (
    <div className="main-window">
      <div className="component">
        <GeometryCreator />
      </div>
      <div className="component">
        {/* <AnimationTimelineEditor /> */}
        <TransformPanel />
      </div>
      <div className="component">
        <SceneTree />
      </div>
      <div className="canvas-container component-viewport">
        <Viewport />
      </div>
    </div>
  );
}
