import { AnimationKey } from '@/resource/image/units/spriteMap';
import { Actor, ActorArgs, AnimationStrategy, Vector } from 'excalibur';

export class KeyedAnimationActor extends Actor {
    constructor(private opts: ActorArgs) {
        super(opts);
    }

    public cloneStatic(args: ActorArgs = {}): KeyedAnimationActor {
        const staticClone = new KeyedAnimationActor(Object.assign(this.opts, args));
        staticClone.useAnimation('static');
        return staticClone;
    }

    public battleFieldEntry?(_pos: Vector): Promise<void> {
        return Promise.resolve();
    }

    public getHeadshotTransforms(): { offset?: Vector; scale?: Vector } {
        throw new Error('[getHeadshotTransforms] Must be implemented by inheritors');
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
