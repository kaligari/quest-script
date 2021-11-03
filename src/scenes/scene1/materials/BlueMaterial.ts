import { Color3, StandardMaterial } from '@babylonjs/core'

export default class BlueMaterial {
    material: StandardMaterial
    constructor(app) {
        this.material = new StandardMaterial('blueMaterial', app.scene)
        this.material.diffuseColor = new Color3(0, 0, 1)
    }
}