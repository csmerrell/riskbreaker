import { EquipmentMeta } from '../types/Equipment';

export const armor = {
    worn_leather_garb: {
        name: 'Worn Leather Garb',
        slots: ['body'],
        stat: {
            defense: 3,
        },
    },
} as const satisfies Record<string, EquipmentMeta>;
