import { getTimeToDestination_Run, getTimeToDestination_Walk } from '@/lib/helpers/movement.helper';
import type { CharacterAnimationEvent, ScriptedEvent } from '../scenes';

export async function scriptCharacterAnimation(event: ScriptedEvent & CharacterAnimationEvent) {
    const { actor, animationKey, strategy, movement } = event;
    return new Promise<void>(async (resolve) => {
        const animation = actor.useAnimation(animationKey, {
            strategy,
        });
        if (movement) {
            const { destination } = movement;
            const duration =
                (movement.duration ?? movement.type === 'walk')
                    ? getTimeToDestination_Walk(actor.pos, destination)
                    : getTimeToDestination_Run(actor.pos, destination);
            actor.actions
                .moveTo({ pos: destination, duration })
                .toPromise()
                .then(() => {
                    actor.stopAnimation();
                    resolve();
                });
        } else {
            await animation;
            resolve();
        }
    });
}
