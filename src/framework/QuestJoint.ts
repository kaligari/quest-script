import { Mesh, PointerEventTypes, Quaternion, Tools, Vector3 } from '@babylonjs/core'
import { QuestJointController } from './QuestJointController'
import { QuestJointAxis, QuestJointParams, QuestJointState, QuestJointTransform } from './types'

export class QuestJoint {
    instance: QuestJointController
    state: QuestJointState
    // State
    isInitOnce: boolean
    isInit: boolean
    isShaked: boolean
    // Params
    mesh: Mesh
    transformType: QuestJointTransform
    axis: QuestJointAxis
    max: number
    min: number
    // Init mesh params
    maxPosition: number
    minPosition: number
    // Distance between mesh and controller - once on every pointer down 
    initDistance: Vector3
    initController: Vector3
    initPosition: Vector3
    initAngle: number
    initOnceAngle: number
    initOncePosition: Vector3
    initQuaternion: Quaternion

    value: number
    oldValue: number

    constructor(
        instance: QuestJointController,
        mesh: Mesh,
        params: QuestJointParams
    ) {        
        // Init
        this.instance = instance
        this.state = QuestJointState.IDLE
        this.mesh = mesh
        
        this.isInitOnce = false
        this.isInit = false
        this.isShaked = false
        
        this.initDistance = new Vector3(0, 0, 0)
        this.initController = new Vector3(0, 0, 0)
        this.initPosition = new Vector3(0, 0, 0)
        this.initOncePosition = new Vector3(0, 0, 0)
        this.maxPosition = 0
        this.minPosition = 0
        this.initQuaternion = new Quaternion()
        this.initAngle = 0
        this.initOnceAngle = 0
        
        // Params
        this.transformType = params.transformType
        this.axis = params.axis
        this.min = params.min
        this.max = params.max

        this.value = 0
        this.oldValue = 0

        // Init buttons observable
        this.instance.scene.onPointerObservable.add(() => {
            // Init every pointerdown
            if(!this.isInit) {
                // this.initDistance = this.instance.controllerMesh.parent?.['position'].clone().subtract(this.mesh.position.clone())
                this.initController = this.instance.controllerMesh.parent?.['position'].clone()
                this.initPosition = this.mesh.getPositionExpressedInLocalSpace()
                this.initAngle = this.mesh.rotation[this.axis]
                this.isInit = true
            }
            // Init once since models are loaded
            if(!this.isInitOnce) {
                this.initOncePosition = this.mesh.getPositionExpressedInLocalSpace().clone()
                // Get current mesh rotation quaternion
                this.initQuaternion = this.mesh.absoluteRotationQuaternion.clone()
                // Inverse quaternion to work directly on axis given in options
                this.initQuaternion = Quaternion.Inverse(this.initQuaternion)
                // Calc angles
                this.initOnceAngle = this.calcAxis()
                this.isInitOnce = true
            }
            // Check if mesh is intersecting with controller mesh
            if (this.mesh.intersectsMesh(this.instance.controllerMesh, false)) {
                this.state = QuestJointState.HOLDING
            }
        }, PointerEventTypes.POINTERDOWN)

        this.instance.scene.onPointerObservable.add(() => {
            // Change state
            this.state = QuestJointState.DROPPING
            // Reset state
            this.isInit = false
        }, PointerEventTypes.POINTERUP)

        this.instance.scene.onBeforeRenderObservable.add(() => {
            this.holdingAnimation()
            this.dropAnimation()
        })
    }

    forceVector(): Vector3 {
        // Get controller vector - from init point to current
        const controllerVector = this.instance.controllerMesh.parent?.['position'].subtract(this.initController)
        // Create new empty force vector
        const forceVector = new Vector3(0, 0, 0)
        // Rotate controller vector to this inverted quaternion
        controllerVector.rotateByQuaternionAroundPointToRef(this.initQuaternion, Vector3.Zero(), forceVector)
        return forceVector
    }

    calcAxis(): number {
        const axis1 = this.mesh.getPivotPoint().y - this.forceVector().y
        const axis2 = this.mesh.getPivotPoint().z - this.forceVector().z
        return Math.atan2(axis1 * -1, axis2)
    }

    shake() {
        if(!this.isShaked) {
            this.instance.shake(0.25, 50)
            this.isShaked = true
        }
    }

    holdingAnimation() {
        if(this.instance.controllerMesh !== null && this.state === QuestJointState.HOLDING) {
            let desiredValue
            let min
            let max

            switch(this.transformType) {
                case QuestJointTransform.ROTATION:
                    desiredValue = this.calcAxis() + this.initAngle - this.initOnceAngle

                    if(Tools.ToDegrees(this.mesh.rotation[this.axis] + this.initOnceAngle) > 179){
                    //     this.mesh.rotation[this.axis] = this.mesh.rotation[this.axis] + this.initOnceAngle
                        console.log(Tools.ToDegrees(this.mesh.rotation[this.axis] + this.initOnceAngle))
                    }
                    
                    max = Tools.ToRadians(this.max)
                    min = Tools.ToRadians(this.min)

                    if(desiredValue > max) {
                        this.value  = max
                        this.shake()
                    } else if(desiredValue < min) {
                        this.value  = min
                        this.shake()
                    } else {
                        this.value = desiredValue
                    }
                    
                    this.mesh.rotation[this.axis] = this.value

                    break;
                case QuestJointTransform.POSITION:
                    
                    desiredValue = this.forceVector()[this.axis]
                    max = this.max - this.initPosition[this.axis]
                    min = this.min - this.initPosition[this.axis]
                    
                    if(desiredValue > max) {
                        this.value  = max
                        this.shake()
                    } else if(desiredValue < min) {
                        this.value  = min
                        this.shake()
                    } else {
                        this.value = desiredValue
                    }
                    // Check if value has changed
                    if(this.value != this.oldValue) {
                        this.isShaked = false
                    }
                    this.oldValue = this.value
                    // Transform mesh in axis given in options
                    this.mesh.setPositionWithLocalVector(this.initPosition.add(new Vector3(
                        this.axis === QuestJointAxis.X ? this.value : 0,
                        this.axis === QuestJointAxis.Y ? this.value : 0,
                        this.axis === QuestJointAxis.Z ? this.value : 0
                    )))
                    break;
            }

            
        }
    }

    dropAnimation() {
        if(this.mesh !== undefined && this.state === QuestJointState.DROPPING) {
            switch(this.transformType) {
                case QuestJointTransform.ROTATION:
                    // if(this.mesh.rotation[this.axis] >= Tools.ToRadians(this.min) + this.step){
                    //     this.mesh.rotation[this.axis] -= this.step
                    // } else {
                    //     this.state = QuestJointState.IDLE
                    //     this.mesh.rotation[this.axis] = this.min
                    // }
                    break;
                case QuestJointTransform.POSITION:
                    // if(this.initObjectPosition && this.mesh.position[this.axis] >= this.initObjectPosition[this.axis] + this.min + this.step){
                    //     this.mesh.position[this.axis] -= this.step
                    // } else if(this.initObjectPosition) {
                    //     this.state = QuestJointState.IDLE
                    //     this.mesh.position[this.axis] = this.initObjectPosition[this.axis] + this.min
                    // }
                break;
            }
        }
    }
}