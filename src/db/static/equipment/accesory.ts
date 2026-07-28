import type { EquipmentMeta } from '../types/Equipment';

export const accessory = {
    vampire_focus: {
        name: 'Vampiric Focus',
        slots: ['accessory1', 'accessory2'],
        stat: {},
    },
    ley_analyzer: {
        name: 'Ley Analyzer',
        slots: ['accessory1', 'accessory2'],
        stat: {},
    },
} as const satisfies Record<string, EquipmentMeta>;
