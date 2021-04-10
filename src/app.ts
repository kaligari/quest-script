import QuestScript from './framework/framework'
import { Level } from './scenes/scene1'
import '@babylonjs/loaders/glTF'

const app = new QuestScript()
app.scene.debugLayer.show()

const level = new Level(app.scene)
app.setHandMesh(level.meshes[0])
