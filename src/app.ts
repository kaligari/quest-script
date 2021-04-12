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
    transform: QuestJointTransform
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
    activeMesh: Mesh
    transform: QuestJointTransform
    axis: QuestJointAxis
    STEP: number
    MAX: number
    MIN: number
    initPosition: Vector3

    constructor(
        instance: QuestJointController,
        mesh: Mesh,
        params: QuestJointParams
    ) {        
        // Init
        this.instance = instance
        this.state = QuestJointState.IDLE
        this.activeMesh = mesh
        this.initPosition = mesh.getAbsolutePivotPoint().clone()
        console.log(this.initPosition);
        
        // Params
        this.transform = params.transform
        this.axis = params.axis
        this.STEP = params.step
        this.MIN = params.min
        this.MAX = params.max

        // Init buttons observable
        this.instance.scene.onPointerObservable.add(() => {
            // Check if mesh is intersecting with controller mesh
            if (this.activeMesh.intersectsMesh(this.instance.controllerMesh, false)) {
                this.state = QuestJointState.HOLDING
            }
        }, PointerEventTypes.POINTERDOWN)

        this.instance.scene.onPointerObservable.add(() => {
            this.state = QuestJointState.DROPPING
        }, PointerEventTypes.POINTERUP)

        this.instance.scene.onBeforeRenderObservable.add(() => {
            this.holdingAnimation()
            this.dropAnimation()
        })
    }

    holdingAnimation() {
        if(this.instance.controllerMesh !== null && this.state === QuestJointState.HOLDING) {
            const startDistance = new Vector3(0, 0, 0)
            startDistance.x = this.activeMesh.getAbsolutePivotPoint().x - this.instance.controllerMesh.parent?.['position'].x
            startDistance.y = this.activeMesh.getAbsolutePivotPoint().y - this.instance.controllerMesh.parent?.['position'].y
            startDistance.z = this.activeMesh.getAbsolutePivotPoint().z - this.instance.controllerMesh.parent?.['position'].z
            startDistance.y *= -1
            switch(this.transform) {
                case QuestJointTransform.ROTATION:
                    const desiredValue = Math.atan2(startDistance.y, startDistance.z)
        
                    if(this.activeMesh.rotation[this.axis] < desiredValue) {
                        if(this.activeMesh.rotation[this.axis] < Tools.ToRadians(this.MAX)) {
                            if(Math.abs(this.activeMesh.rotation[this.axis] - desiredValue) > this.STEP) {
                                this.activeMesh.rotation[this.axis] += this.STEP
                            } else {
                                this.activeMesh.rotation[this.axis] = desiredValue
                            }
                        }
                    }
        
                    if(this.activeMesh.rotation[this.axis] > desiredValue) {
                        if(this.activeMesh.rotation[this.axis] > Tools.ToRadians(this.MIN)) {
                            if(Math.abs(this.activeMesh.rotation[this.axis] - desiredValue) > this.STEP) {
                                this.activeMesh.rotation[this.axis] -= this.STEP
                            } else {
                                this.activeMesh.rotation[this.axis] = desiredValue
                            }
                        }
                    }
                    break;
                case QuestJointTransform.POSITION:

                    // if(this.activeMesh.position[this.axis] < startDistance[this.axis]) {
                        if(this.activeMesh.position[this.axis] < this.initPosition[this.axis] + this.MAX) {
                            // if(Math.abs(this.activeMesh.position[this.axis] - startDistance[this.axis]) > this.STEP) {
                            //     this.activeMesh.position[this.axis] += this.STEP
                            // } else {
                                this.activeMesh.position[this.axis] = this.initPosition[this.axis] - startDistance[this.axis]
                                // console.log(this.initPosition[this.axis]);
                                
                            // }
                        }
                    // }
        
                    // if(this.activeMesh.position[this.axis] > startDistance[this.axis]) {
                        if(this.activeMesh.position[this.axis] > this.initPosition[this.axis] + this.MIN) {
                            // if(Math.abs(this.activeMesh.position[this.axis] - startDistance[this.axis]) > this.STEP) {
                            //     this.activeMesh.position[this.axis] -= this.STEP
                            // } else {
                                this.activeMesh.position[this.axis] = this.initPosition[this.axis] - startDistance[this.axis]
                        //     }
                        }
                    // }
                    break;
            }
        }
    }

    dropAnimation() {
        switch(this.transform) {
            case QuestJointTransform.ROTATION:
                if(this.activeMesh !== undefined && this.state === QuestJointState.DROPPING) {
                    if(this.activeMesh.rotation[this.axis] >= Tools.ToRadians(this.MIN) + this.STEP){
                        this.activeMesh.rotation[this.axis] -= this.STEP
                    } else {
                        this.state = QuestJointState.IDLE
                        this.activeMesh.rotation[this.axis] = this.MIN
                    }
                }
                break;
            case QuestJointTransform.POSITION:
                if(this.activeMesh !== undefined && this.state === QuestJointState.DROPPING) {
                    if(this.activeMesh.position[this.axis] >= this.initPosition[this.axis] + this.MIN + this.STEP){
                        this.activeMesh.position[this.axis] -= this.STEP
                    } else {
                        this.state = QuestJointState.IDLE
                        this.activeMesh.position[this.axis] = this.initPosition[this.axis] + this.MIN
                    }
                }
            break;
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
cover.setPivotPoint(new Vector3(0, -0.025, 0.2))
// cover.rotation.x = Tools.ToRadians(45)
cover.position = new Vector3(0, 1.025, globalZ)
cover.material = pinkMaterial
new QuestJoint(jointsController, cover, {
    // transform: QuestJointTransform.POSITION,
    // axis: QuestJointAxis.Z,
    // step: 0.05,
    // min: 0,
    // max: 0.3
    transform: QuestJointTransform.ROTATION,
    axis: QuestJointAxis.X,
    step: 0.05,
    min: 0,
    max: 60
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
    transform: QuestJointTransform.ROTATION,
    axis: QuestJointAxis.Z,
    step: 0.05,
    min: 0,
    max: 60
})

setupXR(app.scene)
