import { Actor, isActor } from 'excalibur';
import { getTimeToDestination_Run, getTimeToDestination_Walk } from '@/lib/helpers/movement.helper';
import type {
    CharacterAnimationEvent,
    CompositeAnimationEvent,
    DestinationMovementArgs,
    DirectionMovementArgs,
    MovementArgs,
} from '../types/CharacterAnimation';
import type { ScriptedEvent } from '../types/GameScript';

function isCompositeAnimation(event: CharacterAnimationEvent): event is CompositeAnimationEvent {
    return (event as CompositeAnimationEvent).animationKey !== undefined;
}

export async function scriptCharacterAnimation(event: ScriptedEvent & CharacterAnimationEvent) {
    if (isCompositeAnimation(event)) {
        return scriptCompositeAnimation(event);
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

function isDestinationMovement(
    movement?: MovementArgs,
): movement is MovementArgs & DestinationMovementArgs {
    return (movement as DestinationMovementArgs)?.destination !== undefined;
}

function isDirectionMovement(
    movement?: MovementArgs,
): movement is MovementArgs & DirectionMovementArgs {
    return (movement as DirectionMovementArgs)?.direction !== undefined;
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
