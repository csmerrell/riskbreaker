import { Actor, Animation, AnimationStrategy } from 'excalibur';

export type KeyedAnimationOptions<T = string> = {
    strategy?: AnimationStrategy;
    next?: keyof T;
    noReset?: boolean;
    scale?: number;
};

export function useKeyedAnimation<T extends Record<string, Animation>>(
    actor: Actor & {
        animations: T;
        strategyRestore: Record<keyof T, AnimationStrategy>;
        activeAnimation?: Animation;
        useAnimation: typeof useKeyedAnimation;
    },
    key: keyof T,
    opts: {
        strategy?: AnimationStrategy;
        next?: keyof T;
        noReset?: boolean;
        scale?: number;
    } = {},
) {
    const { strategy, next } = opts;
    return new Promise<void>((resolve) => {
        if (!actor.animations[key]) {
            return;
        }
        if (strategy) {
            actor.strategyRestore[key] = actor.animations[key].strategy;
            actor.animations[key].strategy = strategy;
        } else if (actor.strategyRestore[key]) {
            actor.animations[key].strategy = actor.strategyRestore[key];
        }
        if (!opts.noReset) {
            actor.animations[key].reset();
        }
        actor.activeAnimation = actor.animations[key].clone();
        actor.activeAnimation.frames.forEach((f) => f.duration && (f.duration /= opts.scale ?? 1));
        actor.graphics.use(actor.activeAnimation);
        actor.activeAnimation.events.on('end', () => {
            resolve();
            if (next) {
                actor.useAnimation(actor, next);
            }
        });
    });
}
