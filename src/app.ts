import QuestScript from './framework/QuestScript'
import box1 from './scenes/scene1/models/box1'
import box2 from './scenes/scene1/models/box2'

// init app
const app = new QuestScript()
app.init()

// add models
new box1(app)
new box2(app)