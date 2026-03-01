import { AnimationKey } from '@/resource/image/units/spriteMap';
import { Actor, ActorArgs, AnimationStrategy, Vector } from 'excalibur';

export class KeyedAnimationActor extends Actor {
    constructor(opts: ActorArgs) {
        super(opts);
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
        return Promise.reject('Animator: [useAnimation] Must be implemented by sub-class');
    }
}
