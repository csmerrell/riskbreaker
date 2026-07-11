import { ImageSource } from 'excalibur';
import { armor } from './armor/';
import { hair } from './hair/';
import { hat } from './hat';
import { unique } from './unique';
import { weapon } from './weapon';
import { accessory } from './accessory';

export const units = {
    armor,
    hair,
    hat,
    unique,
    weapon,
    accessory,
    mannequin: new ImageSource('/image/units/Mannequin.png'),
};

export type AccessoryType = keyof typeof accessory;
export type HairType = keyof typeof hair;
export type WeaponType = keyof typeof weapon;
export type ArmorType = keyof typeof armor;
export type SpriteSourceKey = 'mannequin' | ArmorType | WeaponType | AccessoryType | HairType;
