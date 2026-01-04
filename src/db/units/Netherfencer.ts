import { UnitDefinition } from './BattleUnit';
import { defaultImportedIdle } from './defaults';

export const netherFencer: UnitDefinition = {
    className: 'Netherfencer',
    spriteSheet: {
        sourceName: 'image/units/Netherfencer',
        cellHeight: 100,
        cellWidth: 100,
        numCols: 15,
        numRows: 7,
    },
    speed: {
        chargePerTick: 10,
    },
    health: {
        base: 48,
    },
    animations: {
        idle: defaultImportedIdle,
        meleeExecute: {
            row: 3,
            startFrame: 1,
            frameCount: 14,
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
            frameCount: 3,
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
        frameCount: 4,
        frameDuration: 4,
    },
};
