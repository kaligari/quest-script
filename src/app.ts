import { CannonJSPlugin, Color3, Color4, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, Quaternion, StandardMaterial, Tools, Vector3, WebXRState } from '@babylonjs/core'
import QuestScript from './framework/framework'
// import { Level } from './scenes/scene1'

const app = new QuestScript()
app.scene.debugLayer.show()

// app.scene.debugLayer.show()

// new Level(app.scene)
// app.setHandMesh(level.meshes[0])

class Joint {
    startDistance: Vector3
    scene
    controllerMesh
    interactiveMeshes: Mesh[]
    activeMesh

    constructor(scene) {
        this.scene = scene
        this.startDistance = new Vector3(0, 0, 0)
        this.interactiveMeshes = []

        // Controller mesh
        this.controllerMesh = MeshBuilder.CreateBox("abc", { size: 0.1 }, this.scene)
        this.controllerMesh.visibility = 0.5
        this.controllerMesh.showBoundingBox = true

        // Init pointer observable
        scene.onPointerObservable.add(() => {
            this.onButtonDown()
        }, PointerEventTypes.POINTERDOWN)

        scene.onPointerObservable.add(() => {
            this.onButtonUp()
        }, PointerEventTypes.POINTERUP)
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
        console.log('POINTER DOWN')
        // check for collision with iteractive mesh
        this.interactiveMeshes.forEach(mesh => {
            this.activeMesh = mesh
            this.startDistance.z = this.activeMesh.position.z - this.controllerMesh.parent.position.z
            this.startDistance.y = this.controllerMesh.parent.position.y - this.activeMesh.position.y
            console.log(this.startDistance.z, this.startDistance.y, this.startDistance.y / this.startDistance.z, Math.tan(this.startDistance.y / this.startDistance.z))
            MeshBuilder.CreateLines('line', {
                points: [
                    this.controllerMesh.parent.position,
                    this.activeMesh.position
                ],
                colors: [
                    new Color4(1, 0, 0, 1),
                    new Color4(1, 0, 0, 1)
                ]
            }, this.scene);
            const rotation = Math.tan(this.startDistance.y / this.startDistance.z)
            // const rotation = Tools.ToRadians(90)
            console.log(rotation)
            this.activeMesh.rotation.x = rotation
            
        })
        
    }

    onButtonUp() {
        console.log('POINTER UP')
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
cover.position = new Vector3(0, 1.025, globalZ)
cover.material = blueMaterial
// const pinkMaterial = new StandardMaterial('pinkMaterial', app.scene)
// pinkMaterial.diffuseColor = new Color3(1, 0, 1)
// cover.material = pinkMaterial

joints.addInteractiveMesh(cover)

setupXR(app.scene)
