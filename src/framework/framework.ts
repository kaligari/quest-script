import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'
import '@babylonjs/loaders/glTF'
import { Engine, Scene, ArcRotateCamera, Vector3, MeshBuilder, Mesh } from '@babylonjs/core'

export default class QuestScript {
    private canvas: HTMLCanvasElement
    private engine: Engine
    public scene: Scene
    public camera: ArcRotateCamera
    public xr: any
    public webXRHandMesh: Mesh

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
        this.camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene)
        this.camera.attachControl(this.canvas, true)
        this.webXRHandMesh = new Mesh('webXRHandMesh', this.scene)

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

    setHandMesh(webXRHandMesh) {
        this.webXRHandMesh = webXRHandMesh
    }

    async initWebXR() {
        
        // WebXR controlls
        const makeGrabAreaMesh = (mesh, handedness) => {
            let myGrabBox = MeshBuilder.CreateBox("abc", { size: 0.1 }, this.scene)
            myGrabBox.position.copyFrom(mesh.position)
            myGrabBox.visibility = 0.5
            myGrabBox.showBoundingBox = true
            myGrabBox.setParent(mesh)
            if (handedness[0] === 'l') {
                myGrabBox.locallyTranslate(new Vector3(0.1, 0, 0))
            } else {
                myGrabBox.locallyTranslate(new Vector3(-0.1, 0, 0))
            }
            return myGrabBox
        }

        this.xr = await this.scene.createDefaultXRExperienceAsync({})
        
        this.xr.input.onControllerAddedObservable.add(controller => {
            controller.onMotionControllerInitObservable.add(motionController => {

                if (motionController.handness === 'right') {
                    motionController.onModelLoadedObservable.add(() => {
                        let mesh = controller.grip
                        if(this.webXRHandMesh) {
                            console.log(this.webXRHandMesh)
                            this.webXRHandMesh.position.copyFrom(mesh.position)
                            this.webXRHandMesh.setParent(mesh)
                        }
                        makeGrabAreaMesh(mesh, motionController.handedness)
                    })
                    motionController.getMainComponent().onButtonStateChangedObservable.add((component) => {
                        if (component.changes.pressed) {
                            if (component.pressed) {

                            }
                        }
                    })
                }
            })
        })
    }
}
