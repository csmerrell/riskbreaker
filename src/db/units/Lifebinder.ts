import { InternalSheetAnimation } from '../types';
import { UnitDefinition } from './BattleUnit';
import { defaultIdle } from './defaults';

export const lifebinderSpellExecute: InternalSheetAnimation = {
    row: 4,
    startFrame: 0,
    frameCount: 9,
    frameDuration: 4,
};
export const lifebinder: UnitDefinition = {
    className: 'Lifebinder',
    spriteSheet: {
        sourceName: 'image/units/Lifebinder',
        cellHeight: 60,
        cellWidth: 60,
        numCols: 13,
        numRows: 7,
        flipHorizontal: true,
    },
    speed: {
        chargePerTick: 8,
    },
    health: {
        base: 40,
    },
    animations: {
        idle: defaultIdle,
        spellExecute: lifebinderSpellExecute,
    },
    hurt: {
        in: {
            row: 1,
            startFrame: 1,
            frameCount: 2,
            frameDuration: 10,
        },
        out: {
            row: 1,
            startFrame: 2,
            frameCount: 2,
            frameDuration: 10,
        },
    },
    healed: {
        in: {
            row: 3,
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
        row: 2,
        startFrame: 0,
        frameCount: 4,
        frameDuration: 4,
    },
};
