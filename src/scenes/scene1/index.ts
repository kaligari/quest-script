import { HemisphericLight, Mesh, Scene, Vector3 } from '@babylonjs/core'

export class Level {
    private scene: Scene;
    public meshes: Mesh[];

    constructor(scene) {
        this.scene = scene
        this.addLights()
        this.meshes = []
        this.addModels()
    }

    addLights() {
        new HemisphericLight('light1', new Vector3(1, 1, 0), this.scene)
    }

    async addModels() {
        // const model1 = await SceneLoader.ImportMeshAsync('Cabinate', '/src/scenes/scene1/assets/drawer/', 'scene.gltf', this.scene)
        // const cabinate = model1.meshes[0]
        // cabinate.name = 'Cabinate'
        // cabinate.id = 'Cabinate'
        // cabinate.scaling = new Vector3(0.01, 0.01, 0.01)
        // cabinate.position = new Vector3(0, -1, 0)
        // // drawer.position = new Vector3(0, 0, 1.5)
        // cabinate.rotation = new Vector3(0, 0, 0)
        // this.meshes.push(cabinate as Mesh)

        // const model2 = await SceneLoader.ImportMeshAsync('Drawer1', '/src/scenes/scene1/assets/drawer/', 'scene.gltf', this.scene)
        // const drawer = model2.meshes[0]
        // drawer.name = 'Drawer'
        // drawer.id = 'Drawer'
        // drawer.scaling = new Vector3(0.01, 0.01, 0.01)
        // drawer.position = new Vector3(0, 0, -0.09)
        // // drawer.position = new Vector3(0, 0, 1.5)
        // drawer.rotation = new Vector3(0, 0, 0)
        // this.meshes.push(drawer as Mesh)
    }
}