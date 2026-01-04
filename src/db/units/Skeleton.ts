import { UnitDefinition } from './BattleUnit';
import { defaultImportedIdle } from './defaults';

export const skeleton: UnitDefinition = {
    className: 'Skeleton',
    spriteSheet: {
        sourceName: 'image/enemy/Skeleton',
        cellHeight: 100,
        cellWidth: 100,
        numCols: 8,
        numRows: 7,
        flipHorizontal: true,
    },
    speed: {
        chargePerTick: 9,
    },
    health: {
        base: 36,
    },
    animations: {
        idle: defaultImportedIdle,
        meleeExecute: {
            row: 3,
            startFrame: 1,
            frameCount: 6,
            frameDuration: 2,
        },
    },
    hurt: {
        in: {
            row: 5,
            startFrame: 0,
            frameCount: 2,
            frameDuration: 10,
        },
        out: {
            row: 5,
            startFrame: 2,
            frameCount: 2,
            frameDuration: 10,
        },
    },
    healed: {
        in: {
            row: 0,
            startFrame: 0,
            frameCount: 1,
            frameDuration: 10,
        },
        out: {
            row: 0,
            startFrame: 0,
            frameCount: 1,
            frameDuration: 2,
        },
    },
    death: {
        row: 6,
        startFrame: 0,
        frameCount: 3,
        frameDuration: 4,
    },
};
