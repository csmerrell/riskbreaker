import { Sprite, Vector } from 'excalibur';
import { AnimationMetadata, ExternalSheetAnimation } from '../types';
import { SpriteGenericAnimationKey } from '../units/BattleUnit';

export type EventFrameDefinition = { start: number; end: number };
export type ActionFreezeFrameDefinition = {
    in: { row: number; col: number };
    out: { row: number; col: number };
};

export type MeleeAction = {
    range: 'melee';
};

export type AnimatedProjectile = {
    projectileType: 'animated';
    projectileAnimation: ExternalSheetAnimation;
    offset?: Vector;
};

export type StaticProjectile = {
    projectileType: 'static';
    sprite: Sprite;
    freezeFrames: Pick<ActionFreezeFrameDefinition, 'in'>;
    vfx: {
        release?: AnimationMetadata;
        impact?: AnimationMetadata;
    };
};

export type ProjectileAction = {
    range: 'projectile';
    projectileType: 'animated' | 'static';
} & (AnimatedProjectile | StaticProjectile);

export type DamageAction = {
    type: 'damage';
    potency: number | number[];
    hurtFrames: EventFrameDefinition[];
};

export type RestorativeAction = {
    type: 'restorative';
    potency: number;
    healFrames: EventFrameDefinition;
};

export type StatusAction = {
    type: 'status';
};

export type ActionMetadata = {
    name: string;
    dbPath: string;
    type: 'damage' | 'restorative' | 'status';
    range: 'melee' | 'projectile';
    executeAnimation: SpriteGenericAnimationKey;
    freezeFrames?: ActionFreezeFrameDefinition;
    ctCost: number;
    targetCt: number;
} & (DamageAction | RestorativeAction | StatusAction) &
    (MeleeAction | ProjectileAction);

export function isDamageAction(action: ActionMetadata): action is ActionMetadata & DamageAction {
    return action.type === 'damage';
}

export function isRestorativeAction(
    action: ActionMetadata,
): action is ActionMetadata & RestorativeAction {
    return action.type === 'restorative';
}

export function isStatusAction(action: ActionMetadata): action is ActionMetadata & StatusAction {
    return action.type === 'status';
}

export function isMeleeAction(action: ActionMetadata): action is ActionMetadata & MeleeAction {
    return action.range === 'melee';
}

export function isProjectileAction(
    action: ActionMetadata,
): action is ActionMetadata & ProjectileAction {
    return action.range === 'projectile';
}

export function isStaticProjectileAction(
    action: ProjectileAction,
): action is ProjectileAction & StaticProjectile {
    return action.projectileType === 'static';
}

export function isAnimatedProjectileAction(
    action: ProjectileAction,
): action is ProjectileAction & AnimatedProjectile {
    return action.projectileType === 'animated';
}
