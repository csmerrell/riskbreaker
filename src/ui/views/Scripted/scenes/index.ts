import { Actor, AnimationStrategy, Scene, Vector } from 'excalibur';
import { introMetadata } from './intro';
import { AnimationKey } from '@/resource/image/units/spriteMap';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { CharacterLine } from '@/state/useDialogue';

type ScriptedEventBase = {
    type: 'dialogue' | 'characterAnimation';
    endSignal?: 'playerConfirm' | 'animationEnd' | 'actorFrame';
    preDelay?: number;
    postDelay?: number;
};

type MovementArgs = {
    destination: Vector;
    type: 'walk' | 'run' | 'jump' | 'teleport';
    duration?: number;
};

type JumpMovementArgs = MovementArgs & {
    type: 'jump';
    duration: number;
};

export type CharacterAnimationEvent = {
    type: 'characterAnimation';
    actor: CompositeActor;
    animationKey: AnimationKey;
    strategy?: AnimationStrategy;
    movement?: MovementArgs | JumpMovementArgs;
};

export type DialogueEvent = {
    type: 'dialogue';
} & CharacterLine;

export type ScriptedEvent = ScriptedEventBase & (CharacterAnimationEvent | DialogueEvent);

export type ScriptedScene = {
    type: 'exploration' | 'battle';
    scene: Scene;
    map: string;
    actors: Actor[];
    events: ScriptedEvent[];
};

export const scenes: Record<string, ScriptedScene> = {
    intro: introMetadata,
};
