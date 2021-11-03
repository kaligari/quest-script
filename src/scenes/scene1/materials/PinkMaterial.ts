import { Color3, StandardMaterial } from '@babylonjs/core'

export default class PinkMaterial {
    material: StandardMaterial
    constructor(app) {
        this.material = new StandardMaterial('pinkMaterial', app.scene)
        this.material.diffuseColor = new Color3(1, 0, 1)
    }
}