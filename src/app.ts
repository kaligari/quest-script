import { CannonJSPlugin, Color3, Color4, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, Quaternion, Scene, StandardMaterial, Tools, Vector3, WebXRState } from '@babylonjs/core'
import QuestScript from './framework/framework'
// import { Level } from './scenes/scene1'

const app = new QuestScript()
// app.scene.debugLayer.show()

// app.scene.debugLayer.show()
// new Level(app.scene)
// app.setHandMesh(level.meshes[0])
enum QuestJointState {
    IDLE,
    HOLDING,
    DROPPING
}

enum QuestJointTransform {
    POSITION = 'position',
    ROTATION = 'rotation',
    SCALING = 'scaling'
}

enum QuestJointAxis {
    X = 'x',
    Y = 'y',
    Z = 'z'
}

type QuestJointParams = {
    transformType: QuestJointTransform
    axis: QuestJointAxis
    step: number
    min: number
    max: number
}

class QuestJointController {
    scene: Scene
    controllerMesh: Mesh
    
    constructor(scene: Scene) {
        // Bind with scene
        this.scene = scene

        // Controller mesh
        this.controllerMesh = MeshBuilder.CreateBox('controllerMesh', { size: 0.1 }, this.scene)
        this.controllerMesh.visibility = 0.5
        this.controllerMesh.showBoundingBox = true
    }

    addMeshController(mesh) {
        this.controllerMesh.setParent(mesh)
        this.controllerMesh.position = Vector3.ZeroReadOnly;
        this.controllerMesh.rotationQuaternion = Quaternion.Identity();
    }
}

class QuestJoint {
    instance: QuestJointController
    state: QuestJointState
    mesh: Mesh
    transformType: QuestJointTransform
    axis: QuestJointAxis
    step: number
    max: number
    min: number
    maxPosition: number | undefined
    minPosition: number | undefined
    initObjectPosition: number | undefined
    initOnceObjectPosition: number | undefined
    initControllerPosition: number | undefined
    initDistance: number | undefined

    constructor(
        instance: QuestJointController,
        mesh: Mesh,
        params: QuestJointParams
    ) {        
        // Init
        this.instance = instance
        this.state = QuestJointState.IDLE
        this.mesh = mesh
        this.initObjectPosition = undefined
        this.initOnceObjectPosition = undefined
        this.initControllerPosition = undefined
        this.maxPosition = undefined
        this.minPosition = undefined
        this.initDistance = undefined
        
        // Params
        this.transformType = params.transformType
        this.axis = params.axis
        this.step = params.step
        this.min = params.min
        this.max = params.max

        // Init buttons observable
        this.instance.scene.onPointerObservable.add(() => {
            if(this.initObjectPosition === undefined) {
                this.initObjectPosition = this.mesh.position[this.axis]
            }
            if(this.initOnceObjectPosition === undefined) {
                this.initOnceObjectPosition = this.mesh.position[this.axis]
            }
            if(this.maxPosition === undefined && this.initObjectPosition !== undefined) {
                this.maxPosition = this.initObjectPosition + this.max
            }
            if(this.minPosition === undefined && this.initObjectPosition !== undefined) {
                this.minPosition = this.initObjectPosition + this.min
            }
            if(this.initControllerPosition === undefined) {
                this.initControllerPosition = this.instance.controllerMesh.parent?.['position'][`_${this.axis}`]
            }
            if(this.initDistance === undefined && this.initControllerPosition !== undefined) {
                this.initDistance = Math.abs(this.initObjectPosition - this.initControllerPosition)
                console.log(this.mesh.name, this.initControllerPosition, this.initObjectPosition, this.initDistance, this.maxPosition, this.minPosition)
            }
            // Check if mesh is intersecting with controller mesh
            if (this.mesh.intersectsMesh(this.instance.controllerMesh, false)) {
                this.state = QuestJointState.HOLDING
                // console.log('holding')
            }
        }, PointerEventTypes.POINTERDOWN)

        this.instance.scene.onPointerObservable.add(() => {
            this.state = QuestJointState.DROPPING
            console.log(this.mesh.name, this.initControllerPosition, this.initObjectPosition, this.initDistance, this.maxPosition, this.minPosition)
            this.initObjectPosition = undefined
            this.initControllerPosition = undefined
            this.initDistance = undefined
        }, PointerEventTypes.POINTERUP)

        this.instance.scene.onBeforeRenderObservable.add(() => {
            this.holdingAnimation()
            this.dropAnimation()
        })
    }

    holdingAnimation() {
        if(this.instance.controllerMesh !== null && this.state === QuestJointState.HOLDING) {
            switch(this.transformType) {
                case QuestJointTransform.ROTATION:

                    // const startDistance = new Vector3(0, 0, 0)
                    // startDistance.x = this.mesh.getAbsolutePivotPoint().x - this.instance.controllerMesh.parent?.['position'].x
                    // startDistance.y = this.mesh.getAbsolutePivotPoint().y - this.instance.controllerMesh.parent?.['position'].y
                    // startDistance.z = this.mesh.getAbsolutePivotPoint().z - this.instance.controllerMesh.parent?.['position'].z
                    // startDistance.y *= -1

                    // const desiredValue = Math.atan2(startDistance.y, startDistance.z)
        
                    // if(this.mesh.rotation[this.axis] < desiredValue) {
                    //     if(this.mesh.rotation[this.axis] < Tools.ToRadians(this.max)) {
                    //         if(Math.abs(this.mesh.rotation[this.axis] - desiredValue) > this.step) {
                    //             this.mesh.rotation[this.axis] += this.step
                    //         } else {
                    //             this.mesh.rotation[this.axis] = desiredValue
                    //         }
                    //     }
                    // }
        
                    // if(this.mesh.rotation[this.axis] > desiredValue) {
                    //     if(this.mesh.rotation[this.axis] > Tools.ToRadians(this.min)) {
                    //         if(Math.abs(this.mesh.rotation[this.axis] - desiredValue) > this.step) {
                    //             this.mesh.rotation[this.axis] -= this.step
                    //         } else {
                    //             this.mesh.rotation[this.axis] = desiredValue
                    //         }
                    //     }
                    // }
                    break;
                case QuestJointTransform.POSITION:
                    if(this.initDistance) {
                        const controllerPosition = this.instance.controllerMesh.parent?.['position'][`_${this.axis}`]
                        

                        this.mesh.position[this.axis] = controllerPosition + this.initDistance
                    }
                    
                    break;
            }
        }
    }

    dropAnimation() {
        if(this.mesh !== undefined && this.state === QuestJointState.DROPPING) {
            switch(this.transformType) {
                case QuestJointTransform.ROTATION:
                    if(this.mesh.rotation[this.axis] >= Tools.ToRadians(this.min) + this.step){
                        this.mesh.rotation[this.axis] -= this.step
                    } else {
                        this.state = QuestJointState.IDLE
                        this.mesh.rotation[this.axis] = this.min
                    }
                    break;
                case QuestJointTransform.POSITION:
                    // if(this.initObjectPosition && this.mesh.position[this.axis] >= this.initObjectPosition[this.axis] + this.min + this.step){
                    //     this.mesh.position[this.axis] -= this.step
                    // } else if(this.initObjectPosition) {
                    //     this.state = QuestJointState.IDLE
                    //     this.mesh.position[this.axis] = this.initObjectPosition[this.axis] + this.min
                    // }
                break;
            }
        }
    }
}

const jointsController = new QuestJointController(app.scene)

const setupXR = async (scene) => {
    
    const xrHelper = await scene.createDefaultXRExperienceAsync({ floorMeshes: [ground] })
    
    xrHelper.input.onControllerAddedObservable.add(inputSource => {
        inputSource.onMotionControllerInitObservable.add(motionController => {
            // add observable
            motionController.onModelLoadedObservable.add(() => {
                if(motionController.handedness === 'right') {      
                    jointsController.addMeshController(inputSource.grip)
                }
            })            
        })
    })
}

const globalZ = 0.5

const ground = MeshBuilder.CreateGround('ground', {
    width: 16,
    height: 16
}, app.scene)
ground.position = new Vector3(0, 0, globalZ)

const box = MeshBuilder.CreateBox('box', {
    width: 0.4,
    depth: 0.4,
    height: 1
}, app.scene); 
box.setPivotPoint(new Vector3(0, 0, 0.2))
box.position = new Vector3(0, 0.5, globalZ)
const blueMaterial = new StandardMaterial('blueMaterial', app.scene)
blueMaterial.diffuseColor = new Color3(0, 0, 1)
box.material = blueMaterial

const box2 = MeshBuilder.CreateBox('box', {
    width: 0.4,
    depth: 0.4,
    height: 1
}, app.scene); 
box2.setPivotPoint(new Vector3(0, 0, 0.2))
box2.position = new Vector3(1, 0.5, globalZ)
box2.rotation = new Vector3(0, 45, 0)
box2.material = blueMaterial

const pinkMaterial = new StandardMaterial('pinkMaterial', app.scene)
pinkMaterial.diffuseColor = new Color3(1, 0, 1)

const cover = MeshBuilder.CreateBox('cover', {
    width: 0.4,
    depth: 0.4,
    height: 0.05
}, app.scene)
// cover.setPivotPoint(new Vector3(0, -0.025, 0.2))
// cover.rotation.x = Tools.ToRadians(45)
cover.position = new Vector3(0, 1.025, globalZ)
cover.material = pinkMaterial
new QuestJoint(jointsController, cover, {
    transformType: QuestJointTransform.POSITION,
    axis: QuestJointAxis.Z,
    step: 0.05,
    min: 0,
    max: 0.4
    // transformType: QuestJointTransform.ROTATION,
    // axis: QuestJointAxis.X,
    // step: 0.05,
    // min: 0,
    // max: 60
})

const cover2 = MeshBuilder.CreateBox('cover', {
    width: 0.4,
    depth: 0.4,
    height: 0.05
}, app.scene)
cover2.setPivotPoint(new Vector3(0, -0.025, 0.2))
cover2.position = new Vector3(1, 1.025, globalZ)
cover2.rotation = new Vector3(0, 45, 0)
cover2.material = pinkMaterial
new QuestJoint(jointsController, cover2, {
    transformType: QuestJointTransform.ROTATION,
    axis: QuestJointAxis.Z,
    step: 0.02,
    min: 0,
    max: 60
})

setupXR(app.scene)
