import { equipment } from '../equipment';

export type EquipmentSlotKey = 'mainHand' | 'offHand' | 'body' | 'head' | 'accessory';
export type StatMap = Partial<{
    hp: number;
    mp: number;
    attack: number;
    magic: number;
    defense: number;
    resistance: number;
    block: number;
    speed: number;
}>;
export type EquipmentMeta = {
    name: string;
    slots: EquipmentSlotKey[];
    stat: StatMap;
    special?: unknown;
    script?: unknown;
};
export type StaticEquipmentKey = keyof typeof equipment;
export type KeyedEquipmentMeta = {
    key: StaticEquipmentKey;
} & EquipmentMeta;
