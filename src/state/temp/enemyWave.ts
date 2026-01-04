import { ConditionState } from '@/game/strategems/Condition';
import { SaveState, StrategemSaveState } from '../saveState';

const randomCondition: ConditionState = {
    type: 'any',
    unitPool: 'party',
};

const Skeleton = {
    unitPath: 'units/Skeleton',
    strategems: [
        {
            conditionList: [randomCondition],
            targetCondition: randomCondition,
            actionPath: 'actions/skeleton/BasicAttack',
        },
    ] as StrategemSaveState[],
    equipment: {},
};

export const tempStaticEnemyWave: SaveState = {
    roster: {
        0: { ...Skeleton },
    },
    battleParty: [
        { id: 0, cell: 'top', line: 'mid' },
        { id: 0, cell: 'bottom', line: 'mid' },
        { id: 0, cell: 'mid', line: 'mid' },
        { id: 0, cell: 'top', line: 'front' },
        { id: 0, cell: 'bottom', line: 'front' },
    ],
};
