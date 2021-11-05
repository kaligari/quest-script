import { MeshBuilder, Vector3 } from '@babylonjs/core'
import { QuestJoint, QuestJointTransform, QuestJointAxis } from '../../../framework/QuestScript'
import BlueMaterial from '../materials/BlueMaterial'
import PinkMaterial from '../materials/PinkMaterial'

export default class box1 {
    constructor(app) {
        const box = MeshBuilder.CreateBox('box', {
            width: 0.4,
            depth: 0.4,
            height: 1
        }, app.scene)
        box.position = new Vector3(0, 0.5, 0.5)
        box.material = new BlueMaterial(app).material
        const cover = MeshBuilder.CreateBox('cover', {
            width: 0.4,
            depth: 0.4,
            height: 0.05
        }, app.scene)
        cover.setPivotPoint(new Vector3(0, -0.025, 0.2))
        cover.position = new Vector3(0, 1.025, 0.5)
        cover.material = new PinkMaterial(app).material
        new QuestJoint(app.jointsController, cover, {
            transformType: QuestJointTransform.POSITION,
            axis: QuestJointAxis.X,
            min: -.4,
            max: 0,
            name: 'box1'
        })
    }
}