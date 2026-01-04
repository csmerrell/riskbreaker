import { ActionMetadata } from '../Action';

export const offering: ActionMetadata = {
    name: 'Offering',
    dbPath: 'actions/lifebinder/Offering',
    type: 'restorative', // 'damage' | 'restorative' | 'status'
    range: 'projectile', // 'melee' | 'projectile'
    executeAnimation: 'spellExecute',
    ctCost: 125,
    potency: 25,
    targetCt: 1,
    healFrames: { start: 2, end: 3 },
    projectileType: 'animated',
    projectileAnimation: {
        isExternal: true,
        name: 'lifebinderOffering',
        sheet: {
            sourceName: 'image/units/Lifebinder',
            cellHeight: 60,
            cellWidth: 60,
            numCols: 12,
            numRows: 7,
        },
        anim: {
            row: 6,
            startFrame: 0,
            frameCount: 5,
            frameDuration: 3,
        },
    },
};
