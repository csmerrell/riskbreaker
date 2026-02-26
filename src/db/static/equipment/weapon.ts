import { EquipmentMeta } from '@/db/static/types/Equipment';

export const weapons = {
    worn_scimitar: {
        name: 'Worn Scimitar',
        slots: ['mainHand', 'offHand'],
        stat: {
            attack: 3,
        },
    },
    worn_buckler: {
        name: 'Worn Buckler',
        slots: ['offHand'],
        stat: {
            defense: 1,
            block: 15,
        },
    },
    worn_tome: {
        name: 'Worn Tome',
        slots: ['mainHand', 'offHand'],
        stat: {
            mp: 10,
            magic: 3,
        },
    },
} as const satisfies Record<string, EquipmentMeta>;
