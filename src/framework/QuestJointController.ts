import { Mesh, MeshBuilder, Quaternion, Scene, Vector3 } from '@babylonjs/core'

export class QuestJointController {
    scene: Scene
    controllerMesh: Mesh
    haptic: any
    
    constructor(scene: Scene) {
        // Bind with scene
        this.scene = scene

        // Controller mesh
        this.controllerMesh = MeshBuilder.CreateBox('controllerMesh', { size: 0.1 }, this.scene)
        this.controllerMesh.visibility = 0.5
        this.controllerMesh.showBoundingBox = true

        // Haptics
        this.haptic = undefined
    }

    addMeshController(mesh) {
        this.controllerMesh.setParent(mesh)
        this.controllerMesh.position = Vector3.ZeroReadOnly;
        this.controllerMesh.rotationQuaternion = Quaternion.Identity();
    }

    addHaptic(haptic) {
        if(haptic) {
            this.haptic = haptic
        }
    }

    shake(intensy, duration) {
        if(this.haptic) {
            this.haptic.pulse(intensy, duration)
        }
    }
}