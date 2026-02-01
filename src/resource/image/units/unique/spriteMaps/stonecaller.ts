import { FrameMap } from '../../spriteMap';

export const stonecallerSpriteMap = {
    static: {
        frames: [[0, 6, 0]],
    },
    poisedSlide: {
        frames: [[3, 6, 0]],
    },
    stomp: {
        frames: [
            [1, 6, 2],
            [2, 6, 2],
            [3, 6, 2],
        ],
    },
    unhood: {
        frames: [
            [1, 7, 2],
            [2, 7, 2],
            [3, 7, 2],
            [4, 7, 2],
        ],
    },
} as const satisfies Record<string, FrameMap>;
