import { Color3, Mesh, MeshBuilder, PointerEventTypes, Quaternion, Scene, StandardMaterial, Tools, Vector3 } from '@babylonjs/core'
import { QuestJointController } from './framework/QuestJointController'
import QuestScript from './framework/QuestScript'
import { QuestJointAxis, QuestJointParams, QuestJointState, QuestJointTransform } from './framework/types'
import { QuestJoint } from './framework/QuestJoint'

const app = new QuestScript()

app.init()

// Materials
const blueMaterial = new StandardMaterial('blueMaterial', app.scene)
blueMaterial.diffuseColor = new Color3(0, 0, 1)
const pinkMaterial = new StandardMaterial('pinkMaterial', app.scene)
pinkMaterial.diffuseColor = new Color3(1, 0, 1)

// Box 1
const box = MeshBuilder.CreateBox('box', {
    width: 0.4,
    depth: 0.4,
    height: 1
}, app.scene)
box.position = new Vector3(0, 0.5, 0.5)
box.material = blueMaterial
const cover = MeshBuilder.CreateBox('cover', {
    width: 0.4,
    depth: 0.4,
    height: 0.05
}, app.scene)
cover.setPivotPoint(new Vector3(0, -0.025, 0.2))
cover.position = new Vector3(0, 1.025, 0.5)
cover.material = pinkMaterial
new QuestJoint(app.jointsController, cover, {
    transformType: QuestJointTransform.POSITION,
    axis: QuestJointAxis.X,
    min: -.4,
    max: 0
})

// Box 2
const box2 = MeshBuilder.CreateBox('box', {
    width: 0.4,
    depth: 0.4,
    height: 1
}, app.scene); 
box2.setPivotPoint(new Vector3(0, 0, 0.2))
box2.position = new Vector3(0.5, 0.5, 0.5)
box2.material = blueMaterial

const cover2 = MeshBuilder.CreateBox('cover', {
    width: 0.4,
    depth: 0.4,
    height: 0.05
}, app.scene)
cover2.setPivotPoint(new Vector3(0, -0.025, 0.2))
cover2.position = new Vector3(0.5, 1.025, 0.5)
cover2.material = pinkMaterial
new QuestJoint(app.jointsController, cover2, {
    transformType: QuestJointTransform.ROTATION,
    axis: QuestJointAxis.X,
    min: 0,
    max: 60
})
