import { CannonJSPlugin, MeshBuilder, PhysicsImpostor, PointerEventTypes, Vector3, WebXRState } from '@babylonjs/core'
import QuestScript from './framework/framework'
import * as cannon from 'cannon'
// import { Level } from './scenes/scene1'

const app = new QuestScript()
app.scene.enablePhysics(new Vector3(0,-9.81, 0), new CannonJSPlugin(true, 10, cannon))

const ground = MeshBuilder.CreateGround('ground', {
    width: 16,
    height: 16
}, app.scene)
ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
    mass: 0,
    friction: 0.5,
    restitution: 0.7
}, app.scene)

const box = MeshBuilder.CreateBox('box', {
    size: 1
}, app.scene); 
box.position = new Vector3(0, 0.5, 0)
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
sphere.position.y = 1.5
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
    const xrHelper = await scene.createDefaultXRExperienceAsync({ floorMeshes: [ground] })

    scene.onPointerObservable.add((pointerInfo) => {
        console.log('POINTER DOWN', pointerInfo)
        if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
            // "Grab" it by attaching the picked mesh to the VR Controller
            if (xrHelper.baseExperience.state === WebXRState.IN_XR) {
                let xrInput = xrHelper.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
                if(xrInput) {
                    let motionController = xrInput.motionController
                    if (motionController) {
                        const mesh = pointerInfo.pickInfo.pickedMesh
                        tmpMass = mesh.physicsImpostor.mass
                        console.log(tmpMass)
                        mesh.physicsImpostor.mass = 0
                        mesh.setParent(motionController.rootMesh)
                    }
                }
            }
        }
    }, PointerEventTypes.POINTERDOWN)

    scene.onPointerObservable.add((pointerInfo) => {
        console.log('POINTER UP', pointerInfo)
        if (pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
            // "Grab" it by attaching the picked mesh to the VR Controller
            if (xrHelper.baseExperience.state === WebXRState.IN_XR) {
                let xrInput = xrHelper.pointerSelection.getXRControllerByPointerId(pointerInfo.event.pointerId)
                if(xrInput) {
                    let motionController = xrInput.motionController
                    if (motionController) {
                        const mesh = pointerInfo.pickInfo.pickedMesh
                        mesh.physicsImpostor.mass = tmpMass
                        mesh.setParent(null)
                    }
                }
            }
        }
    }, PointerEventTypes.POINTERUP)
}

setupXR(app.scene)
