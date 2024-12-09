import GeometryCreator from "./GeometryCreator";
import GeometryDropZone from "./GeometryDropZone";
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
      <GeometryDropZone />
      <div className="canvas-container component-viewport">
        <Viewport />
      </div>
    </div>
  );
}
