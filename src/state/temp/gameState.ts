import { BattleMember } from '../types/BattleMember';

export const tempGameState = {
    party: [
        {
            class: 'Netherfencer',
            line: 'front',
            cell: 'top',
        },
        {
            class: 'Netherfencer',
            line: 'front',
            cell: 'bottom',
        },
        {
            class: 'Lifebinder',
            line: 'mid',
            cell: 'top',
        },
        {
            class: 'Netherfencer',
            line: 'mid',
            cell: 'mid',
        },
        {
            class: 'Lifebinder',
            line: 'mid',
            cell: 'bottom',
        },
    ] as BattleMember[],
};
