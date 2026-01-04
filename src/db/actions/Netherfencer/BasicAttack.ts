import { ActionMetadata } from '../Action';

export const basicAttack: ActionMetadata = {
    name: 'Attack',
    dbPath: 'actions/netherfencer/BasicAttack',
    type: 'damage',
    range: 'melee',
    ctCost: 175,
    targetCt: 1,
    freezeFrames: {
        in: { row: 3, col: 1 },
        out: { row: 4, col: 1 },
    },
    executeAnimation: 'meleeExecute',
    potency: [4, 4, 8],
    hurtFrames: [
        { start: 2, end: 4 },
        { start: 5, end: 7 },
        { start: 11, end: 12 },
    ],
};
