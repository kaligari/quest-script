import { CannonJSPlugin, Color3, Color4, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, Quaternion, Scene, StandardMaterial, Tools, Vector3, WebXRState } from '@babylonjs/core'
import QuestScript from './framework/framework'
// import { Level } from './scenes/scene1'

const app = new QuestScript()
app.scene.debugLayer.show()

// app.scene.debugLayer.show()

// new Level(app.scene)
// app.setHandMesh(level.meshes[0])

enum JointStatus {
    IDLE,
    HOLDING,
    DROPPING
}

class Joint {
    startDistance: Vector3
    scene: Scene
    controllerMesh: Mesh
    interactiveMeshes: Mesh[]
    activeMesh: Mesh | undefined
    state: JointStatus
    desiredRotation
    STEP = 0.05
    MAX = 60
    MIN = 0

    constructor(scene) {
        // Scene
        this.scene = scene

        this.startDistance = new Vector3(0, 0, 0)
        this.interactiveMeshes = []
        this.state = JointStatus.IDLE
        this.desiredRotation = 0

        // Active mesh
        this.activeMesh = undefined

        // Controller mesh
        this.controllerMesh = MeshBuilder.CreateBox('controllerMesh', { size: 0.1 }, this.scene)
        this.controllerMesh.visibility = 0.5
        this.controllerMesh.showBoundingBox = true

        // model consts
        this.STEP = 0.05
        this.MAX = 60
        this.MIN = 0

        // Init pointer observable
        scene.onPointerObservable.add(() => {
            this.onButtonDown()
        }, PointerEventTypes.POINTERDOWN)

        scene.onPointerObservable.add(() => {
            this.onButtonUp()
        }, PointerEventTypes.POINTERUP)

        scene.onBeforeRenderObservable.add(() => {
            this.holdingAnimation()
            this.dropAnimation()
        })
    }

    addInteractiveMesh(mesh) {
        const pinkMaterial = new StandardMaterial('pinkMaterial', app.scene)
        pinkMaterial.diffuseColor = new Color3(1, 0, 1)
        cover.material = pinkMaterial
        this.interactiveMeshes.push(mesh)
    }

    // WebXR controlls
    makeGrabAreaMesh(mesh, motionController) {
        this.controllerMesh.setParent(mesh)
        this.controllerMesh.position = Vector3.ZeroReadOnly;
        this.controllerMesh.rotationQuaternion = Quaternion.Identity();
        if (motionController.handedness[0] === 'l') {
            this.controllerMesh.locallyTranslate(new Vector3(0, 0, 0))
        } else {
            this.controllerMesh.locallyTranslate(new Vector3(0, 0, 0))
        }
    }

    onButtonDown() {
        this.state = JointStatus.HOLDING
        this.interactiveMeshes.forEach(mesh => {
            this.activeMesh = mesh
        })
    }

    holdingAnimation() {
        // check for collision with iteractive mesh        
        if('parent' in this.controllerMesh && this.activeMesh !== undefined && this.controllerMesh !== null && this.state === JointStatus.HOLDING) {
            this.startDistance.z = this.activeMesh.getAbsolutePivotPoint().z - this.controllerMesh.parent?.['position'].z
            this.startDistance.y = this.activeMesh.getAbsolutePivotPoint().y - this.controllerMesh.parent?.['position'].y
            this.startDistance.y *= -1
            this.desiredRotation = Math.atan2(this.startDistance.y, this.startDistance.z)
            // rotate animation
            if(this.activeMesh.rotation.x < this.desiredRotation && this.activeMesh.rotation.x <= Tools.ToRadians(this.MAX)) {
                if(Math.abs(this.activeMesh.rotation.x - this.desiredRotation) > this.STEP) {
                    this.activeMesh.rotation.x += this.STEP
                } else {
                    this.activeMesh.rotation.x = this.desiredRotation
                }
            }
            if(this.activeMesh.rotation.x > this.desiredRotation && this.activeMesh.rotation.x >= Tools.ToRadians(this.MIN)) {
                if(Math.abs(this.activeMesh.rotation.x - this.desiredRotation) > this.STEP) {
                    this.activeMesh.rotation.x -= this.STEP
                } else {
                    this.activeMesh.rotation.x = this.desiredRotation
                }
            }
        }
    }

    dropAnimation() {
        if(this.activeMesh !== undefined && this.state === JointStatus.DROPPING) {
            if(this.activeMesh.rotation.x >= Tools.ToRadians(this.MIN) + this.STEP){
                this.activeMesh.rotation.x -= this.STEP
            } else {
                this.state = JointStatus.IDLE
                this.activeMesh.rotation.x = this.MIN
            }
        }
    }

    onButtonUp() {
        this.state = JointStatus.DROPPING
    }
}

const joints = new Joint(app.scene)

const setupXR = async (scene) => {
    let meshController = new Mesh('meshController', scene)
    
    const xrHelper = await scene.createDefaultXRExperienceAsync({ floorMeshes: [ground] })
    
    xrHelper.input.onControllerAddedObservable.add(inputSource => {
        inputSource.onMotionControllerInitObservable.add(motionController => {
            // add observable
            motionController.onModelLoadedObservable.add(() => {
                if(motionController.handedness === 'right') {
                    meshController = inputSource.grip as Mesh                
                    let mesh = inputSource.grip
                    joints.makeGrabAreaMesh(mesh, motionController)
                }
            })            
        })
    })

    // scene.onPointerObservable.add((pointerInfo) => {
    //     console.log('POINTER DOWN', pointerInfo)

    //     // if (xrHelper.baseExperience.state === WebXRState.IN_XR) {
    //     //     let xrInput = xrHelper.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
    //     //     if(xrInput) {
    //     //         let motionController = xrInput.motionController
    //     //         if (motionController) {

    //     //         }
    //     //     }
    //     // }
    // })

    // scene.onPointerObservable.add((pointerInfo) => {
    //     joins.controllerPositionOnStart
    //     console.log('POINTER DOWN', pointerInfo)
    //     if (xrHelper.baseExperience.state === WebXRState.IN_XR) {
    //         let xrInput = xrHelper.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
    //         if(xrInput) {
    //             let motionController = xrInput.motionController
    //             if (motionController) {
    //             }
    //         }
    //     }
    //     // if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
    //     //     // "Grab" it by attaching the picked mesh to the VR Controller
    //     //     if (xrHelper.baseExperience.state === WebXRState.IN_XR) {
    //     //         let xrInput = xrHelper.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
    //     //         if(xrInput) {
    //     //             let motionController = xrInput.motionController
    //     //             if (motionController) {
    //     //                 grabbedMesh = pointerInfo.pickInfo.pickedMesh
    //     //                 if(grabbedMesh.physicsImpostor) {
    //     //                     console.log(motionController.handedness)
    //     //                     if(motionController.handedness === 'right') {
    //     //                         grabbedMesh.setParent(meshController)
    //     //                         grabbedMesh.position = Vector3.ZeroReadOnly;
    //     //                         grabbedMesh.rotationQuaternion = Quaternion.Identity();
    //     //                         grabbedMesh.locallyTranslate(new Vector3(0, -.5, 1))
    //     //                     }
    //     //                     // mesh.setParent(motionController.rootMesh)
    //     //                 }
    //     //             }
    //     //         }
    //     //     }
    //     // }
    // }, PointerEventTypes.POINTERDOWN)

    // scene.onPointerObservable.add((pointerInfo) => {
    //     // grabbedMesh.setParent(null)
    //     console.log('POINTER UP', pointerInfo)
    //     // if(typeof grabbedMesh !== null && grabbedMesh.physicsImpostor) {
    //     //     grabbedMesh.physicsImpostor.mass = 1
    //     // }
    //     // if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
    //     //     // "Grab" it by attaching the picked mesh to the VR Controller
    //     //     if (xrHelper.baseExperience.state === WebXRState.IN_XR) {
    //     //         // console.log(grabbedMesh)
    //     //         // grabbedMesh.setParent(null)
    //     //         // if(typeof grabbedMesh !== null && grabbedMesh.physicsImpostor) {
    //     //         //     grabbedMesh.physicsImpostor.mass = 1
    //     //         // }
    //     //         // let xrInput = xrHelper.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
    //     //         // if(xrInput) {
    //     //         //     let motionController = xrInput.motionController
    //     //         //     if (motionController) {
    //     //         //         const mesh = pointerInfo.pickInfo.pickedMesh
    //     //         //         mesh.physicsImpostor.mass = tmpMass
    //     //         //         mesh.setParent(null)
    //     //         //     }
    //     //         // }
    //     //     }
    //     // }
    // }, PointerEventTypes.POINTERUP)
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
box.position = new Vector3(0, 0.5, globalZ)
const blueMaterial = new StandardMaterial('blueMaterial', app.scene)
blueMaterial.diffuseColor = new Color3(0, 0, 1)
box.material = blueMaterial


const cover = MeshBuilder.CreateBox('cover', {
    width: 0.4,
    depth: 0.4,
    height: 0.05
}, app.scene)
cover.setPivotPoint(new Vector3(0, -0.025, 0.2))
cover.rotation.x = Tools.ToRadians(45)
cover.position = new Vector3(0, 1.025, globalZ)
cover.material = blueMaterial
// const pinkMaterial = new StandardMaterial('pinkMaterial', app.scene)
// pinkMaterial.diffuseColor = new Color3(1, 0, 1)
// cover.material = pinkMaterial

joints.addInteractiveMesh(cover)

setupXR(app.scene)
