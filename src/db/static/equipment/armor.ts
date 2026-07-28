import { EquipmentMeta } from '../types/Equipment';

export const armor = {
    worn_leather_garb: {
        name: 'Worn Leather Garb',
        slots: ['body'],
        stat: {
            defense: 3,
        },
    },
    mana_stitched_cloak: {
        name: 'Mana-stitched Cloak',
        slots: ['body'],
        stat: {
            magic: 10,
        },
    },
} as const satisfies Record<string, EquipmentMeta>;
