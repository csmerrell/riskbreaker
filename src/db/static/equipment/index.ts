import { EquipmentMeta } from '../types/Equipment';
import { accessory } from './accesory';
import { armor } from './armor';
import { hat } from './hat';
import { weapons } from './weapon';

export const equipment = {
    ...weapons,
    ...armor,
    ...hat,
    ...accessory,
} as const satisfies Record<string, EquipmentMeta>;

export type EquipmentKey = keyof typeof equipment;
