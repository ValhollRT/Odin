import { Scene, MeshBuilder, Vector3 } from 'babylonjs';

export class GeometryFactory {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  createSphere() {
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, this.scene);
    sphere.position = new Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
  }

  createBox() {
    const box = MeshBuilder.CreateBox("box", { size: 2 }, this.scene);
    box.position = new Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
  }

}
