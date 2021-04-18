import { CannonJSPlugin, Color3, Color4, GizmoManager, Matrix, Mesh, MeshBuilder, PhysicsImpostor, PointerDragBehavior, PointerEventTypes, Quaternion, Scene, Space, StandardMaterial, Tools, Vector3, WebXRState } from '@babylonjs/core'
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
    // State
    isInitOnce: boolean
    isInit: boolean
    // Params
    mesh: Mesh
    transformType: QuestJointTransform
    axis: QuestJointAxis
    max: number
    min: number
    // Init mesh params
    maxPosition: number
    minPosition: number
    // Distance between mesh and controller - once on every pointer down 
    initDistance: Vector3
    initController: Vector3
    initPosition: Vector3
    initOncePosition: Vector3

    constructor(
        instance: QuestJointController,
        mesh: Mesh,
        params: QuestJointParams
    ) {        
        // Init
        this.instance = instance
        this.state = QuestJointState.IDLE
        this.mesh = mesh
        
        this.isInitOnce = false
        this.isInit = false
        
        this.initDistance = new Vector3(0, 0, 0)
        this.initController = new Vector3(0, 0, 0)
        this.initPosition = new Vector3(0, 0, 0)
        this.initOncePosition = new Vector3(0, 0, 0)
        this.maxPosition = 0
        this.minPosition = 0
        
        // Params
        this.transformType = params.transformType
        this.axis = params.axis
        this.min = params.min
        this.max = params.max

        // Init buttons observable
        this.instance.scene.onPointerObservable.add(() => {
            // Init every pointerdown
            if(!this.isInit) {
                // this.initDistance = this.instance.controllerMesh.parent?.['position'].clone().subtract(this.mesh.position.clone())
                this.initController = this.instance.controllerMesh.parent?.['position'].clone()
                this.initPosition = this.mesh.getPositionExpressedInLocalSpace()
                this.isInit = true
            }
            // Init once since models are loaded
            if(!this.isInitOnce) {
                this.initOncePosition = this.mesh.position.clone()
                this.isInitOnce = true
            }
            // Check if mesh is intersecting with controller mesh
            if (this.mesh.intersectsMesh(this.instance.controllerMesh, false)) {
                this.state = QuestJointState.HOLDING
            }
        }, PointerEventTypes.POINTERDOWN)

        this.instance.scene.onPointerObservable.add(() => {
            // Change state
            this.state = QuestJointState.DROPPING
            // Reset state
            this.isInit = false
        }, PointerEventTypes.POINTERUP)

        this.instance.scene.onBeforeRenderObservable.add(() => {
            this.holdingAnimation()
            this.dropAnimation()
        })
    }

    holdingAnimation() {
        if(this.instance.controllerMesh !== null && this.state === QuestJointState.HOLDING) {
            let desiredValue
            let min
            let max
            switch(this.transformType) {
                case QuestJointTransform.ROTATION:
                    // Calc tangent of rotation angle for mesh and controller positions
                    const axis1 = this.mesh.getAbsolutePivotPoint().y - this.instance.controllerMesh.parent?.['position']._y
                    const axis2 = this.mesh.getAbsolutePivotPoint().z - this.instance.controllerMesh.parent?.['position']._z
                    desiredValue = Math.atan2(axis1 * -1, axis2)
                    max = Tools.ToRadians(this.max)
                    min = Tools.ToRadians(this.min)
                    break;
                case QuestJointTransform.POSITION:
                    // Get controller vector - from init point to current
                    const controllerVector = this.instance.controllerMesh.parent?.['position'].subtract(this.initController)
                    // Create new empty force vector
                    const forceVector = new Vector3(0, 0, 0)
                    // Get current mesh rotation quaternion
                    let quaternion = this.mesh.absoluteRotationQuaternion.clone()
                    // Inverse quaternion to work directly on axis given in options
                    quaternion = Quaternion.Inverse(quaternion)
                    // Rotate controller vector to this inverted quaternion
                    controllerVector.rotateByQuaternionAroundPointToRef(quaternion, Vector3.Zero(), forceVector)
                    
                    let meshTransform
                    desiredValue = forceVector[this.axis]
                    max = this.max
                    min = this.min
                    
                    if(desiredValue > max) {
                        meshTransform  = max
                    } else if(desiredValue < min) {
                        meshTransform  = min
                    } else {
                        meshTransform = desiredValue
                    }
                    // Transform mesh in axis given in options
                    this.mesh.setPositionWithLocalVector(this.initPosition.add(new Vector3(
                        this.axis === QuestJointAxis.X ? meshTransform : 0,
                        this.axis === QuestJointAxis.Y ? meshTransform : 0,
                        this.axis === QuestJointAxis.Z ? meshTransform : 0
                    )))
                    break;
            }

            
        }
    }

    dropAnimation() {
        if(this.mesh !== undefined && this.state === QuestJointState.DROPPING) {
            switch(this.transformType) {
                case QuestJointTransform.ROTATION:
                    // if(this.mesh.rotation[this.axis] >= Tools.ToRadians(this.min) + this.step){
                    //     this.mesh.rotation[this.axis] -= this.step
                    // } else {
                    //     this.state = QuestJointState.IDLE
                    //     this.mesh.rotation[this.axis] = this.min
                    // }
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

// Ground
const ground = MeshBuilder.CreateGround('ground', {
    width: 16,
    height: 16
}, app.scene)
ground.position = new Vector3(0, 0, globalZ)

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
}, app.scene); 
// box.setPivotPoint(new Vector3(0, 0, 0.2))
box.rotation = new Vector3(0, Tools.ToRadians(45), 0)
box.position = new Vector3(0, 0.5, globalZ)
box.material = blueMaterial

const cover = MeshBuilder.CreateBox('cover', {
    width: 0.4,
    depth: 0.4,
    height: 0.05
}, app.scene)
// cover.setPivotPoint(new Vector3(0, 0, 0))
cover.rotation = new Vector3(0, Tools.ToRadians(45), 0)
cover.position = new Vector3(0, 1.025, globalZ)
cover.material = pinkMaterial
new QuestJoint(jointsController, cover, {
    transformType: QuestJointTransform.POSITION,
    axis: QuestJointAxis.Y,
    min: 0,
    max: 0.4  
})

// Box 2
const box2 = MeshBuilder.CreateBox('box', {
    width: 0.4,
    depth: 0.4,
    height: 1
}, app.scene); 
box2.setPivotPoint(new Vector3(0, 0, 0.2))
box2.position = new Vector3(1, 0.5, globalZ)
// box2.rotation = new Vector3(0, 45, 0)
box2.material = blueMaterial

const cover2 = MeshBuilder.CreateBox('cover', {
    width: 0.4,
    depth: 0.4,
    height: 0.05
}, app.scene)
cover2.setPivotPoint(new Vector3(0, -0.025, 0.2))
cover2.position = new Vector3(1, 1.025, globalZ)
// cover2.rotation = new Vector3(0, 45, 0)
cover2.material = pinkMaterial
new QuestJoint(jointsController, cover2, {
    transformType: QuestJointTransform.POSITION,
    axis: QuestJointAxis.X,
    min: -0.2,
    max: 0.2
})

setupXR(app.scene)
