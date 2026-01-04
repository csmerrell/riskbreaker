import { SpriteSheetDefinition, InternalSheetAnimation } from '../types';

export type HealthDefinition = {
    base: number;
};

export type SpeedDefinition = {
    chargePerTick: number;
};

export type UnitClassKey =
    | 'Stonemaker'
    | 'Lifebinder'
    | 'Soulsword'
    | 'Oathsworn'
    | 'Netherfencer'
    | 'Arcanist'
    | 'Blackarrow'
    | 'Skeleton';

export type SpriteGenericAnimationKey =
    | 'idle'
    | 'meleeExecute'
    | 'spellExecute'
    | 'spellChannelLoop'
    | 'spellChannelWindup';

export type UnitDefinition = {
    className: UnitClassKey;
    spriteSheet: SpriteSheetDefinition;
    speed: SpeedDefinition;
    health: HealthDefinition;
    animations: {
        idle: InternalSheetAnimation;
    } & Partial<Record<Exclude<SpriteGenericAnimationKey, 'idle'>, InternalSheetAnimation>>;
    hurt: {
        in: InternalSheetAnimation;
        out: InternalSheetAnimation;
    };
    healed: {
        in: InternalSheetAnimation;
        out: InternalSheetAnimation;
    };
    death: InternalSheetAnimation;
};
