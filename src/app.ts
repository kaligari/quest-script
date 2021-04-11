import { CannonJSPlugin, Mesh, MeshBuilder, PhysicsImpostor, PointerEventTypes, Quaternion, Vector3, WebXRState } from '@babylonjs/core'
import QuestScript from './framework/framework'
import * as cannon from 'cannon'
// import { Level } from './scenes/scene1'

const app = new QuestScript()
app.scene.enablePhysics(new Vector3(0,-9.81, 0), new CannonJSPlugin(true, 10, cannon))

const ground = MeshBuilder.CreateGround('ground', {
    width: 16,
    height: 16
}, app.scene)
ground.position = new Vector3(0, 0, 3)
ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
    mass: 0,
    friction: 0.5,
    restitution: 0.7
}, app.scene)

const box = MeshBuilder.CreateBox('box', {
    size: 1
}, app.scene); 
box.position = new Vector3(0, 0.5, 3)
// box.rotation = new Vector3(0, 0, 0.2)
box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, {
    mass: 0,
    friction: 0.5,
    restitution: 0.7
}, app.scene)

const sphere = MeshBuilder.CreateSphere('sphere', {
    diameter: 0.5,
    segments: 32
}, app.scene)
sphere.position = new Vector3(0, 1.5, 3)
sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {
    mass: 1,
    friction: 0.5,
    restitution: 0.7
}, app.scene)

// app.scene.debugLayer.show()

// new Level(app.scene)
// app.setHandMesh(level.meshes[0])
const setupXR = async (scene) => {
    let tmpMass = 0
    let meshController = new Mesh('meshController', scene)
    let grabbedMesh = new Mesh('grabbedMesh', scene)

    // WebXR controlls
    const makeGrabAreaMesh = (mesh, handedness) => {
        let myGrabBox = MeshBuilder.CreateBox("abc", { size: 0.1 }, scene)
        myGrabBox.visibility = 0.5
        myGrabBox.showBoundingBox = true
        myGrabBox.setParent(mesh)
        myGrabBox.position = Vector3.ZeroReadOnly;
        myGrabBox.rotationQuaternion = Quaternion.Identity();
        if (handedness[0] === 'l') {
            myGrabBox.locallyTranslate(new Vector3(0.1, 0, 0))
        } else {
            myGrabBox.locallyTranslate(new Vector3(-0.1, 0, 0))
        }
        return myGrabBox
    }

    const xrHelper = await scene.createDefaultXRExperienceAsync({ floorMeshes: [ground] })
    
    xrHelper.input.onControllerAddedObservable.add(inputSource => {
        inputSource.on
        inputSource.onMotionControllerInitObservable.add(motionController => {
            motionController.onModelLoadedObservable.add(() => {
            if(motionController.handedness === 'right') {
                meshController = inputSource.grip as Mesh                
            }
            if(motionController.handedness === 'left') {
                const sphere = MeshBuilder.CreateSphere('sphere', {
                    diameter: 0.5,
                    segments: 32
                }, scene)
                sphere.position = new Vector3(0, 2.5, 3)
                sphere.rotationQuaternion = Quaternion.Identity();
                sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {
                    mass: 1,
                    friction: 0.5,
                    restitution: 0.7
                }, scene)
            }
            let mesh = inputSource.grip
            makeGrabAreaMesh(mesh, motionController.handedness)
            })
        })
    })

    scene.onPointerObservable.add((pointerInfo) => {
        // console.log('POINTER DOWN', pointerInfo)
        if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
            // "Grab" it by attaching the picked mesh to the VR Controller
            if (xrHelper.baseExperience.state === WebXRState.IN_XR) {
                let xrInput = xrHelper.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
                if(xrInput) {
                    let motionController = xrInput.motionController
                    if (motionController) {
                        grabbedMesh = pointerInfo.pickInfo.pickedMesh
                        if(grabbedMesh.physicsImpostor) {
                            tmpMass = grabbedMesh.physicsImpostor.mass
                            grabbedMesh.physicsImpostor.mass = 0
                            console.log(motionController.handedness)
                            if(motionController.handedness === 'right') {
                                grabbedMesh.setParent(meshController)
                                grabbedMesh.position = Vector3.ZeroReadOnly;
                                grabbedMesh.rotationQuaternion = Quaternion.Identity();
                                grabbedMesh.locallyTranslate(new Vector3(0, -.5, 1))
                            }
                            // mesh.setParent(motionController.rootMesh)
                        }
                    }
                }
            }
        }
    }, PointerEventTypes.POINTERDOWN)

    scene.onPointerObservable.add((pointerInfo) => {
        grabbedMesh.setParent(null)
        if(typeof grabbedMesh !== null && grabbedMesh.physicsImpostor) {
            grabbedMesh.physicsImpostor.mass = 1
        }
        // console.log('POINTER UP', pointerInfo)
        if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
            // "Grab" it by attaching the picked mesh to the VR Controller
            if (xrHelper.baseExperience.state === WebXRState.IN_XR) {
                // console.log(grabbedMesh)
                // grabbedMesh.setParent(null)
                // if(typeof grabbedMesh !== null && grabbedMesh.physicsImpostor) {
                //     grabbedMesh.physicsImpostor.mass = 1
                // }
                // let xrInput = xrHelper.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
                // if(xrInput) {
                //     let motionController = xrInput.motionController
                //     if (motionController) {
                //         const mesh = pointerInfo.pickInfo.pickedMesh
                //         mesh.physicsImpostor.mass = tmpMass
                //         mesh.setParent(null)
                //     }
                // }
            }
        }
    }, PointerEventTypes.POINTERUP)
}

setupXR(app.scene)
