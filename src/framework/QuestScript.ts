import '@babylonjs/core/Debug/debugLayer'
import '@babylonjs/inspector'
import '@babylonjs/loaders/glTF'
import { Engine, Scene, Vector3, FreeCamera, HemisphericLight, MeshBuilder } from '@babylonjs/core'
import { QuestJointController } from './QuestJointController'
export * from './QuestJoint'
export * from './types'

export default class QuestScript {
    private canvas: HTMLCanvasElement
    private engine: Engine
    public scene: Scene
    public camera: FreeCamera
    public xr: any
    public ground
    public jointsController

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
        const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene)
        light.intensity = 0.7

        this.camera = new FreeCamera('FlyCamera', new Vector3(0, 5, 0), this.scene)
        this.camera.setTarget(new Vector3(0, 1, 3))
        this.camera.attachControl(this.canvas, true)

        // init ground
        this.ground = MeshBuilder.CreateGround('ground', {
            width: 16,
            height: 16
        }, this.scene)
        this.ground.position = new Vector3(0, 0, 0.5)

        this.jointsController = new QuestJointController(this.scene)
    }

    init() {
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
        const xrHelper = await this.scene.createDefaultXRExperienceAsync({ floorMeshes: [this.ground] })
        
        xrHelper.input.onControllerAddedObservable.add(inputSource => {
            inputSource.onMotionControllerInitObservable.add(motionController => {
                // add observable
                motionController.onModelLoadedObservable.add(() => {
                    if(motionController.handedness === 'right') {      
                        this.jointsController.addMeshController(inputSource.grip)
                        // Search for haptic
                        if (motionController.gamepadObject !== undefined) {
                            if (motionController.gamepadObject.hapticActuators !== undefined) {
                                console.log(`hapticActuators are defined.`);
                                if (motionController.gamepadObject.hapticActuators.length > 0) {
                                    console.log(`Has at least one haptic actuator.`);
                                    this.jointsController.addHaptic(motionController.gamepadObject.hapticActuators[0])
                                }
                            }
                        }
                    }
                })    
            })
        })
    }
}