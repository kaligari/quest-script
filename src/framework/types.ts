export enum QuestJointState {
    IDLE,
    HOLDING,
    DROPPING
}

export enum QuestJointTransform {
    POSITION = 'position',
    ROTATION = 'rotation',
    SCALING = 'scaling'
}

export enum QuestJointAnimationDirection {
    BACKWARD = 'backward',
    FORWARD = 'forward',
    IDLE = 'idle'
}

export enum QuestJointAxis {
    X = 'x',
    Y = 'y',
    Z = 'z'
}

export type QuestJointParams = {
    transformType: QuestJointTransform
    axis: QuestJointAxis
    min: number
    max: number
    name?: string
}