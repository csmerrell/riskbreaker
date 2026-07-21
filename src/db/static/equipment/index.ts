import { EquipmentMeta } from '../types/Equipment';
import { armor } from './armor';
import { weapons } from './weapon';

export const equipment: Record<string, EquipmentMeta> = {
    ...weapons,
    ...armor,
};
