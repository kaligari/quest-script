import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'
import '@babylonjs/loaders/glTF'
import { Engine, Scene, Vector3, FreeCamera, HemisphericLight } from '@babylonjs/core'

export default class QuestScript {
    private canvas: HTMLCanvasElement
    private engine: Engine
    public scene: Scene
    public camera: FreeCamera
    public xr: any

    constructor() {
        // create the canvas html element and attach it to the webpage
        this.canvas = document.createElement('canvas')
        this.canvas.style.width = '100%'
        this.canvas.style.height = '100%'
        this.canvas.id = 'gameCanvas'
        document.body.appendChild(this.canvas)
        
        // initialize babylon scene and engine
        this.engine = new Engine(this.canvas, true)
        this.scene = new Scene(this.engine)
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene)
        light.intensity = 0.7

        this.camera = new FreeCamera('FlyCamera', new Vector3(0, 5, 0), this.scene)
        this.camera.setTarget(new Vector3(0, 1, 3))
        this.camera.attachControl(this.canvas, true)

        // init WebXR
        this.initWebXR()

        // run the main render loop
        this.scene.executeWhenReady(() => {
            this.engine.runRenderLoop(() => {
                this.scene.render()
            })
        })
    }

    enableDevelopmentMode() {
        // hide/show the Inspector
        window.addEventListener('keydown', ev => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide()
                } else {
                    this.scene.debugLayer.show()
                }
            }
        })
    }

    async initWebXR() {
        
        // // WebXR controlls
        // const makeGrabAreaMesh = (mesh, handedness) => {
        //     let myGrabBox = MeshBuilder.CreateBox("abc", { size: 0.1 }, this.scene)
        //    myGrabBox.visibility = 0.5
        //    myGrabBox.showBoundingBox = true
        //    myGrabBox.setParent(mesh)
        //    myGrabBox.position = Vector3.ZeroReadOnly;
        //    myGrabBox.rotationQuaternion = Quaternion.Identity();
        //    if (handedness[0] === 'l') {
        //      myGrabBox.locallyTranslate(new Vector3(0.1, 0, 0))
        //    } else {
        //      myGrabBox.locallyTranslate(new Vector3(-0.1, 0, 0))
        //    }
        //    return myGrabBox
        // }

        // this.xr = await this.scene.createDefaultXRExperienceAsync({})
        
        // this.xr.input.onControllerAddedObservable.add(inputSource => {
        //     inputSource.onMotionControllerInitObservable.add(motionController => {
        //       motionController.onModelLoadedObservable.add(() => {
        //         let mesh = inputSource.grip
        //         makeGrabAreaMesh(mesh, motionController.handedness)
        //       })
        //     })
        // })
    }
}
