import { Actor, Graphic, isActor } from 'excalibur';
import { getTimeToDestination_Run, getTimeToDestination_Walk } from '@/lib/helpers/movement.helper';
import type {
    CharacterAnimationEvent,
    CompositeAnimationEvent,
    DestinationMovementArgs,
    DirectionMovementArgs,
    MovementArgs,
    UniqueAnimationEvent,
} from '../types/CharacterAnimation';
import type { ScriptedEvent } from '../types/GameScript';

function isCompositeAnimation(event: CharacterAnimationEvent): event is CompositeAnimationEvent {
    return (event as CompositeAnimationEvent).animationKey !== undefined;
}

function isUniqueAnimation(event: CharacterAnimationEvent): event is UniqueAnimationEvent {
    return (event as UniqueAnimationEvent).animation !== undefined;
}

export async function scriptCharacterAnimation(event: ScriptedEvent & CharacterAnimationEvent) {
    if (isCompositeAnimation(event)) {
        return scriptCompositeAnimation(event);
    } else if (isUniqueAnimation(event)) {
        return scriptUniqueAnimation(event);
    }
}

function scriptCompositeAnimation(event: CompositeAnimationEvent) {
    const { actor, animationKey, strategy, movement } = event;
    return new Promise<void>(async (resolve) => {
        const animation = actor.useAnimation(animationKey, {
            strategy,
        });
        if (movement) {
            await scriptMovement(event);
            actor.stopAnimation();
        } else {
            await animation;
        }
        resolve();
    });
}

async function scriptUniqueAnimation(event: UniqueAnimationEvent) {
    const { actor, animation, movement, postDelay } = event;
    return new Promise<void>(async (resolve) => {
        const childGraphicSnapshot: Record<number, Graphic> = {};
        actor.children.forEach((child) => {
            if (isActor(child)) {
                childGraphicSnapshot[child.id] = child.graphics.current;
                child.graphics.hide();
            }
        });

        actor.graphics.add('unique', animation);
        actor.graphics.use('unique');

        if (movement) {
            await scriptMovement(event);
        } else {
            await new Promise<void>((resolve) => animation.events.on('end', resolve));
        }

        if (postDelay) {
            await new Promise((resolve) => {
                setTimeout(resolve, postDelay);
            });
        }

        actor.children.forEach((child) => {
            if (isActor(child)) child.graphics.use(childGraphicSnapshot[child.id]);
        });
        actor.graphics.remove('unique');
        resolve();
    });
}

function isDestinationMovement(
    movement: MovementArgs,
): movement is MovementArgs & DestinationMovementArgs {
    return (movement as DestinationMovementArgs).destination !== undefined;
}

function isDirectionMovement(
    movement: MovementArgs,
): movement is MovementArgs & DirectionMovementArgs {
    return (movement as DirectionMovementArgs).direction !== undefined;
}

function scriptMovement(event: CharacterAnimationEvent) {
    if (isDestinationMovement(event.movement))
        return scriptDestinationMovement(event.actor, event.movement);
    else if (isDirectionMovement(event.movement))
        return scriptDirectionMovement(event.actor, event.movement);
}

async function scriptDestinationMovement(
    actor: Actor,
    movement: MovementArgs & DestinationMovementArgs,
) {
    return new Promise<void>((resolve) => {
        const { destination } = movement;
        const duration =
            movement.type === 'walk'
                ? getTimeToDestination_Walk(actor.pos, destination)
                : getTimeToDestination_Run(actor.pos, destination);
        actor.actions
            .moveTo({ pos: destination, duration })
            .toPromise()
            .then(() => {
                resolve();
            });
    });
}

async function scriptDirectionMovement(
    actor: Actor,
    movement: MovementArgs & DirectionMovementArgs,
) {
    return new Promise<void>((resolve) => {
        const { direction, easing } = movement;
        const duration =
            movement.duration ??
            (movement.type === 'walk'
                ? getTimeToDestination_Walk(actor.pos, actor.pos.add(direction))
                : getTimeToDestination_Run(actor.pos, actor.pos.add(direction)));
        actor.actions
            .moveBy({
                offset: direction,
                duration,
                easing,
            })
            .toPromise()
            .then(() => {
                resolve();
            });
    });
}
