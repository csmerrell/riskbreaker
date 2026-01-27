import { ImageSource } from 'excalibur';
import { hair } from './hair/';
import { armor } from './armor/';
import { unique } from './unique';
import { weapon } from './weapon';

export const units = {
    armor,
    hair,
    unique,
    weapon,
    Netherfencer: new ImageSource(
        '/image/import/TinyCharacterPack/Characters/Swordsman/Swordsman.png',
    ),
    Lifebinder: new ImageSource('/image/units/Lifebinder.png'),
    LifebinderLean: new ImageSource('/image/units/LifebinderLean.png'),
    Naturalist: new ImageSource('/image/units/Naturalist.png'),
    NaturalistSit: new ImageSource('/image/units/NaturalistSit.png'),
};
