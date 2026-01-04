import { vfxAttackSheet } from '@/db/vfx/attacks';
import { ActionMetadata } from '../Action';

export const basicAttack: ActionMetadata = {
    name: 'Attack',
    dbPath: 'actions/lifebinder/BasicAttack',
    ctCost: 175,
    type: 'damage',
    potency: 12,
    targetCt: 1,
    hurtFrames: [{ start: 7, end: 10 }],
    range: 'projectile',
    projectileType: 'animated',
    projectileAnimation: {
        isExternal: true,
        name: 'lifebinderBasic',
        sheet: vfxAttackSheet,
        anim: {
            row: 0,
            startFrame: 0,
            frameCount: 15,
            frameDuration: 2,
        },
    },
    executeAnimation: 'spellExecute',
};
