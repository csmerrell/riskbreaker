import { SpriteGridOptions } from '@/resource/image/units/spriteMap';
import { Actor, ActorArgs, Vector } from 'excalibur';
import { Animator, UseKeyedAnimationOpts } from './Animation/Animator';

export class KeyedAnimationActor<T extends string> extends Actor {
    protected spriteDimensions!: SpriteGridOptions;
    public battleEntryKey?: T;

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

    public battleFieldEntry?: (_pos: Vector) => Promise<void>;

    public useAnimation(key: T, opts?: UseKeyedAnimationOpts<string>): Promise<void | void[]> {
        if (!this.get(Animator)) {
            throw new Error(
                `[KeyedAnimationActor] must have an Animator component added in its constructor.\n\nAnimator not found for [${this.name}]`,
            );
        }
        return this.get(Animator).useKeyedAnimation(key, opts);
    }
}
