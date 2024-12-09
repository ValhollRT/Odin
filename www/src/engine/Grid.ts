import { Color3, Mesh, MeshBuilder, Scene } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';

export class Grid {

    public ground: Mesh | undefined

    constructor(scene: Scene) {
        this.build(scene);
    }

    public build(scene: Scene) {
        this.ground = MeshBuilder.CreateGround("ground", 
            {
                width: 200,
                height: 200,
                subdivisions: 10,
                subdivisionsX: 10,
                subdivisionsY: 10,
                updatable: true
            }, scene);
        let grid = new GridMaterial("grid", scene);
        grid.majorUnitFrequency = 10;
        grid.minorUnitVisibility = .5;

        grid.gridRatio = 2;
        grid.backFaceCulling = false;
        grid.mainColor = new Color3(0, 0, 0);
        grid.lineColor = new Color3(.1, .1, .1);
        grid.opacity = .99;
        this.ground.material = grid;
        grid.alphaMode = 10;
        this.ground.isPickable = false;
    }
}