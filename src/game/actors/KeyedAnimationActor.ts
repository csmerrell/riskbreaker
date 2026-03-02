import { AnimationKey, SpriteGridOptions } from '@/resource/image/units/spriteMap';
import { Actor, ActorArgs, AnimationStrategy, vec, Vector } from 'excalibur';

export class KeyedAnimationActor extends Actor {
    protected spriteDimensions!: SpriteGridOptions;

    constructor(private opts: ActorArgs = {}) {
        super(opts);
    }

    public getDimensions() {
        if (!this.spriteDimensions) {
            throw new Error(
                '[spriteDimensions] must be defined as a private property of every KeyedAnimationActor',
            );
        }
        return this.spriteDimensions;
    }

    public getHeadshotTransforms(): { offset?: Vector; scale?: Vector } {
        throw new Error('[getHeadshotTransforms] Must be implemented by inheritors');
    }

    public battleFieldEntry?(_pos: Vector): Promise<void> {
        return Promise.resolve();
    }

    public useAnimation(
        _key: string,
        _opts?: {
            strategy?: AnimationStrategy;
            next?: AnimationKey;
            scale?: number;
            noReset?: boolean;
            noSuppress?: boolean;
        },
    ): Promise<void | void[]> {
        return Promise.resolve();
    }
}
