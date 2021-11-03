import { MeshBuilder, Vector3 } from '@babylonjs/core'
import { QuestJoint, QuestJointTransform, QuestJointAxis } from '../../../framework/QuestScript'
import BlueMaterial from '../materials/BlueMaterial'
import PinkMaterial from '../materials/PinkMaterial'

export default class box2 {
    constructor(app) {

        const box = MeshBuilder.CreateBox('box', {
            width: 0.4,
            depth: 0.4,
            height: 1
        }, app.scene); 
        box.setPivotPoint(new Vector3(0, 0, 0.2))
        box.position = new Vector3(0.5, 0.5, 0.5)
        box.material = new BlueMaterial(app).material
        
        const cover2 = MeshBuilder.CreateBox('cover', {
            width: 0.4,
            depth: 0.4,
            height: 0.05
        }, app.scene)
        cover2.setPivotPoint(new Vector3(0, -0.025, 0.2))
        cover2.position = new Vector3(0.5, 1.025, 0.5)
        cover2.material = new PinkMaterial(app).material
        new QuestJoint(app.jointsController, cover2, {
            transformType: QuestJointTransform.ROTATION,
            axis: QuestJointAxis.X,
            min: 0,
            max: 60
        })
    }
}