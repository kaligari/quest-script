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
}