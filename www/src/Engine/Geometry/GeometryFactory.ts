import { type Scene, MeshBuilder, Vector3 } from 'babylonjs';
import { GeometryType } from './GeometryType';

export class GeometryFactory {
  private readonly scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public createGeometry(type: GeometryType): void {
    switch (type) {
      case GeometryType.Sphere: {
        this.createSphere();
        return;
      }
      case GeometryType.Box: {
        this.createBox();
        return;
      }
      case GeometryType.Cylinder: {
        this.createCylinder();
        return;
      }
      case GeometryType.Cone: {
        this.createCone();
        return;
      }
      case GeometryType.Torus: {
        this.createTorus();
        return;
      }
      default:
        throw new Error(`Geometría desconocida: ${type}`);
    }
  }

  private randomPosition(): Vector3 {
    return new Vector3(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5
    );
  }

  createSphere(): void {
    const sphere = MeshBuilder.CreateSphere(
      'sphere',
      { diameter: 2 },
      this.scene
    );
    sphere.position = this.randomPosition();
  }

  createBox(): void {
    const box = MeshBuilder.CreateBox('box', { size: 2 }, this.scene);
    box.position = this.randomPosition();
  }

  createCylinder(): void {
    const cylinder = MeshBuilder.CreateCylinder(
      'cylinder',
      { height: 3, diameter: 2 },
      this.scene
    );
    cylinder.position = this.randomPosition();
  }

  createCone(): void {
    const cone = MeshBuilder.CreateCylinder(
      'cone',
      { height: 3, diameterTop: 0, diameterBottom: 3 },
      this.scene
    );
    cone.position = this.randomPosition();
  }

  createTorus(): void {
    const torus = MeshBuilder.CreateTorus(
      'torus',
      { diameter: 4, thickness: 1 },
      this.scene
    );
    torus.position = this.randomPosition();
  }

  createPlane(): void {
    const plane = MeshBuilder.CreatePlane('plane', { size: 2 }, this.scene);
    plane.position = this.randomPosition();
  }

  createPyramid(): void {
    const pyramid = MeshBuilder.CreatePolyhedron(
      'pyramid',
      { type: 1, size: 2 },
      this.scene
    );
    pyramid.position = this.randomPosition();
  }

  createRing(): void {
    const ring = MeshBuilder.CreateDisc(
      'ring',
      { radius: 2, tessellation: 20, sideOrientation: 1, arc: 0.5 },
      this.scene
    );
    ring.position = this.randomPosition();
  }

  createEllipsoid(): void {
    const ellipsoid = MeshBuilder.CreateSphere(
      'ellipsoid',
      { diameterX: 2, diameterY: 4, diameterZ: 2 },
      this.scene
    );
    ellipsoid.position = this.randomPosition();
  }

  createPolygon(): void {
    const polygon = MeshBuilder.CreatePolygon(
      'polygon',
      {
        shape: [
          new Vector3(0, 0, 0),
          new Vector3(2, 0, 0),
          new Vector3(2, 2, 0),
          new Vector3(0, 2, 0)
        ],
        depth: 1
      },
      this.scene
    );
    polygon.position = this.randomPosition();
  }
}
