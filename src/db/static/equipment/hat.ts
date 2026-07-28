import type { EquipmentMeta } from '../types/Equipment';

export const hat = {
    lifegiver_lens: {
        name: 'Lifegiver\s Lens',
        slots: ['body'],
        stat: {},
    },
} as const satisfies Record<string, EquipmentMeta>;
