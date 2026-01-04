import { ActionMetadata } from '../Action';

export const basicAttack: ActionMetadata = {
    name: 'Attack',
    dbPath: 'actions/skeleton/BasicAttack',
    type: 'damage',
    range: 'melee',
    ctCost: 175,
    targetCt: 1,
    freezeFrames: {
        in: { row: 3, col: 1 },
        out: { row: 1, col: 6 },
    },
    executeAnimation: 'meleeExecute',
    potency: 12,
    hurtFrames: [{ start: 2, end: 4 }],
};
