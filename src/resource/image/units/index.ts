import { ImageSource } from 'excalibur';
import { hair } from './hair/';
import { armor } from './armor/';
import { unique } from './unique';
import { weapon } from './weapon';
import { accessory } from './accessory';

export const units = {
    armor,
    hair,
    unique,
    weapon,
    accessory,
    mannequin: new ImageSource('/image/units/Mannequin.png'),

    //Deprecated - Test images
    Netherfencer: new ImageSource(
        '/image/import/TinyCharacterPack/Characters/Swordsman/Swordsman.png',
    ),
    Lifebinder: new ImageSource('/image/units/Lifebinder.png'),
    LifebinderLean: new ImageSource('/image/units/LifebinderLean.png'),
    Naturalist: new ImageSource('/image/units/Naturalist.png'),
    NaturalistSit: new ImageSource('/image/units/NaturalistSit.png'),
};

export type AccessoryType = keyof typeof accessory;
export type HairType = keyof typeof hair;
export type WeaponType = keyof typeof weapon;
export type ArmorType = keyof typeof armor;
export type SpriteSourceKey = 'mannequin' | ArmorType | WeaponType | AccessoryType | HairType;
