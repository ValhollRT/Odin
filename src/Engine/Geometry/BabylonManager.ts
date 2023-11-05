import {
  Engine,
  Scene,
  NullEngine,
  ArcRotateCamera,
  HemisphericLight,
  Vector3
} from 'babylonjs';
import log from '../../logConfig';

export class BabylonManager {
  private static instance: BabylonManager;
  public engine: Engine;
  public scene: Scene;

  private constructor(canvas: HTMLCanvasElement | null) {
    this.engine = canvas != null ? new Engine(canvas, true) : new NullEngine();
    this.scene = new Scene(this.engine);
    const camera = new ArcRotateCamera(
      'Camera',
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      this.scene
    );
    camera.attachControl(this.scene, true);
    const defaultLight = new HemisphericLight(
      'light1',
      new Vector3(1, 1, 0),
      this.scene
    );

    log.debug('BabylonManager created ' + defaultLight.name);
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  public static getInstance(canvas: HTMLCanvasElement | null): BabylonManager {
    if (!BabylonManager.instance) {
      BabylonManager.instance = new BabylonManager(canvas);
    } else if (canvas && !BabylonManager.instance.engine.getRenderingCanvas()) {
      BabylonManager.instance = new BabylonManager(canvas);
    }
    return BabylonManager.instance;
  }

  public dispose(): void {
    this.engine.dispose();
  }
}
