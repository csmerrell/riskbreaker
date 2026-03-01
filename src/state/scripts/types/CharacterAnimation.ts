import type { AnimationStrategy, EasingFunction, Vector } from 'excalibur';
import type { AnimationKey } from '@/resource/image/units/spriteMap';
import type { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import type { ScriptedEventBase } from './GameScript';

type MovementArgBase = {
    type: 'walk' | 'run' | 'jump' | 'slide' | 'teleport';
};
export type DestinationMovementArgs = MovementArgBase & {
    destination: Vector;
};
export type DirectionMovementArgs = MovementArgBase & {
    direction: Vector;
};

type TimeOptionalMovementArgs = {
    type: 'walk' | 'run' | 'teleport';
    duration?: number;
    easing?: EasingFunction;
};

type TimedMovementArgs = {
    type: 'jump' | 'slide';
    duration: number;
    easing?: EasingFunction;
};
export type MovementArgs = MovementArgBase &
    (DestinationMovementArgs | DirectionMovementArgs) &
    (TimeOptionalMovementArgs | TimedMovementArgs);

export type CompositeAnimationEvent = ScriptedEventBase & {
    type: 'compositeAnimation';
    actor: CompositeActor;
    animationKey: AnimationKey;
    strategy?: AnimationStrategy;
    movement?: MovementArgs;
};

export type CharacterAnimationEvent = CompositeAnimationEvent;
