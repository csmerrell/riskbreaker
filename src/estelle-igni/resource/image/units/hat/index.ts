import { ImageSource, vec, Vector } from 'excalibur';
import { HairType, HatType } from '..';

export const hat = {
    flowerHairpin: new ImageSource('/image/units/hat/FlowerHairpin.png'),
    goggles: new ImageSource('/image/units/hat/Goggles.png'),
    kitsune: new ImageSource('/image/units/hat/Kitsune.png'),
    plumedHat: new ImageSource('/image/units/hat/PlumedHat.png'),
    riceFarmerHat: new ImageSource('/image/units/hat/RiceFarmerHat.png'),
    sageHat: new ImageSource('/image/units/hat/SageHat.png'),
    shadowHood: new ImageSource('/image/units/hat/ShadowHood.png'),
    sideBeret: new ImageSource('/image/units/hat/SideBeret.png'),
    stonecallerHood: new ImageSource('/image/units/hat/StonecallerHood.png'),
};

export const hatLabels = {
    flowerHairpin: 'Flower Hairpin',
    goggles: "Mechanic's Goggles",
    kitsune: 'Kitsune Mask',
    plumedHat: 'Plumed Tricorne',
    riceFarmerHat: 'Conical Hat',
    sageHat: "Sage's Hat",
    shadowHood: 'Shadow Cowl',
    sideBeret: 'Petit Beret',
    stonecallerHood: "Stonecaller's Hood",
};

export type HatConfig = {
    masking?: boolean;
    cloaking?: boolean;
    hairStyleAdaptation?: Partial<
        Record<
            HairType | 'none',
            {
                offset?: Vector;
                scale?: Vector;
            }
        >
    >;
};
export const hatConfigs: Partial<Record<HatType, HatConfig>> = {
    riceFarmerHat: {
        masking: true,
    },
    plumedHat: {
        masking: true,
    },
    sageHat: {
        masking: true,
    },
    shadowHood: {
        cloaking: true,
    },
    stonecallerHood: {
        cloaking: true,
    },
    kitsune: {
        hairStyleAdaptation: {
            none: {
                offset: vec(0, 2),
                scale: vec(-1, 1),
            },
        },
    },
    flowerHairpin: {
        hairStyleAdaptation: {
            none: {
                offset: vec(0, 1),
            },
        },
    },
    goggles: {
        hairStyleAdaptation: {
            none: {
                offset: vec(1, 2),
            },
        },
    },
    sideBeret: {
        hairStyleAdaptation: {
            none: {
                offset: vec(1, 3),
            },
            bun: {
                offset: vec(0, 1),
            },
            locs: {
                offset: vec(0, 1),
            },
            poofyBob: {
                offset: vec(0, -1),
            },
            shortMessy: {
                offset: vec(0, 1),
            },
            throwback_Black: {
                offset: vec(0, 2),
            },
            throwback_Brown: {
                offset: vec(0, 2),
            },
        },
    },
};
