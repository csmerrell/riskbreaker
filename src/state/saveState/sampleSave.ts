import { ConditionState } from '@/game/strategems/Condition';
import { SaveState, UnitRosterSaveState } from '.';

const healthUnder50Condition: ConditionState = {
    type: 'resourceThreshold',
    unitPool: 'party',
    targetResource: 'CurrentHealth',
    threshold: 60,
    comparator: '<',
    isPercent: true,
};

const lowestHealthCondition: ConditionState = {
    type: 'resourceThreshold',
    unitPool: 'enemy',
    targetResource: 'CurrentHealth',
    threshold: 'lowest',
    comparator: '<',
};

const randomCondition: ConditionState = {
    type: 'any',
    unitPool: 'enemy',
};

const Lifebinder: UnitRosterSaveState = {
    unitPath: 'units/Lifebinder',
    strategems: [
        {
            conditionList: [healthUnder50Condition],
            targetCondition: healthUnder50Condition,
            actionPath: 'actions/lifebinder/Offering',
        },
        {
            conditionList: [lowestHealthCondition],
            targetCondition: lowestHealthCondition,
            actionPath: 'actions/lifebinder/BasicAttack',
        },
    ],
    hotbar: {
        leftSet: {
            hotbarDUp: {
                name: 'Offering',
                imgPath: '/image/icon/offering.png',
            },
        },
        rightSet: {
            hotbarFRight: {
                name: 'Attack',
                imgPath: '/image/icon/slash.png',
            },
        },
    },
    actions: [],
    equipment: {},
};

const Netherfencer: UnitRosterSaveState = {
    unitPath: 'units/Netherfencer',
    strategems: [
        {
            conditionList: [lowestHealthCondition],
            targetCondition: randomCondition,
            actionPath: 'actions/netherfencer/BasicAttack',
        },
    ],
    hotbar: {
        leftSet: {},
        rightSet: {
            hotbarFRight: {
                name: 'Attack',
                imgPath: '/image/icon/slash.png',
            },
        },
    },
    actions: [],
    equipment: {},
};

export const sampleSave: SaveState = {
    roster: {
        0: { ...Lifebinder },
        1: { ...Lifebinder },
        2: { ...Lifebinder },
        3: {
            ...Netherfencer,
            strategems: [
                {
                    ...Netherfencer.strategems[0],
                    targetCondition: lowestHealthCondition,
                },
            ],
        },
        4: {
            ...Netherfencer,
            strategems: [
                {
                    ...Netherfencer.strategems[0],
                    targetCondition: lowestHealthCondition,
                },
            ],
        },
        5: { ...Netherfencer },
    },
    battleParty: [
        { id: 0, cell: 'top', line: 'mid' },
        { id: 1, cell: 'bottom', line: 'mid' },
        { id: 3, cell: 'mid', line: 'mid' },
        { id: 4, cell: 'top', line: 'front' },
        { id: 5, cell: 'bottom', line: 'front' },
    ],
};
