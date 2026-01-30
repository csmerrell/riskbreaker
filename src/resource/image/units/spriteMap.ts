export type FrameMap = {
    //[col, row, durationFrames]
    frames: [number, number, number][];
};

export const COMPOSITE_SPRITE_GRID = {
    spriteHeight: 24,
    spriteWidth: 24,
    rows: 12,
    columns: 12,
};

const map = {
    static: {
        frames: [[0, 0, 0]],
    },
    walkFace: {
        frames: [
            [9, 0, 4],
            [10, 0, 4],
            [11, 0, 4],
        ],
    },
    runFace: {
        frames: [
            [0, 0, 2],
            [1, 0, 1],
            [2, 0, 2],
            [3, 0, 1],
            [0, 0, 2],
            [3, 0, 1],
            [4, 0, 2],
            [5, 0, 1],
            [0, 0, 2],
        ],
    },
    runBack: {
        frames: [
            [0, 0, 2],
            [1, 0, 1],
            [2, 0, 2],
            [3, 0, 1],
            [0, 0, 2],
            [3, 0, 1],
            [4, 0, 2],
            [5, 0, 1],
            [0, 0, 2],
        ],
    },
    idle: {
        frames: [
            [0, 0, 1],
            [6, 2, 1],
            [7, 2, 1],
        ],
    },
    leanRest: {
        frames: [
            [6, 3, 10],
            [7, 3, 6],
        ],
    },
    sitRest: {
        frames: [
            [4, 3, 10],
            [5, 3, 6],
        ],
    },
    focus: {
        frames: [
            [0, 2, 4],
            [1, 2, 0],
        ],
    },
    prepItem: {
        frames: [[3, 2, 0]],
    },
    raiseItem: {
        frames: [[4, 2, 0]],
    },
    handForward: {
        frames: [[5, 2, 0]],
    },
    hurt: {
        frames: [[0, 3, 0]],
    },
    hurtEnd: {
        frames: [
            [1, 3, 1],
            [0, 0, 0],
        ],
    },
    weak: {
        frames: [[2, 3, 0]],
    },
    death: {
        frames: [
            [2, 3, 2],
            [3, 3, 0],
        ],
    },
    dualWieldThreeStrike: {
        frames: [
            [0, 4, 2],
            [1, 4, 1],
            [2, 4, 2],
            [3, 4, 1],
            [4, 4, 2],
            [5, 4, 1],
            [6, 4, 0],
        ],
    },
    dive: {
        frames: [[0, 5, 0]],
    },
    diveAttack: {
        frames: [
            [1, 5, 1],
            [2, 5, 1],
            [3, 5, 0],
        ],
    },
    diveBounce: {
        frames: [[4, 5, 0]],
    },
    dashForward: {
        frames: [[5, 5, 0]],
    },
} as const satisfies Record<string, FrameMap>;

export type AnimationKey = keyof typeof map;
export const spriteMap = map satisfies Record<AnimationKey, FrameMap>;
