import { Actor, Scene } from 'excalibur';
import { introMetadata } from './intro';
import { AnimationKey } from '@/resource/image/units/spriteMap';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';

type ScriptedEventBase = {
    type: 'dialogue' | 'characterAnimation';
    endSignal?: 'playerConfirm' | 'animationEnd' | 'actorFrame';
    preDelay?: number;
    postDelay?: number;
};

type CharacterAnimationEvent = {
    type: 'characterAnimation';
    actor: CompositeActor;
    animationKey: AnimationKey;
};

type DialogueEvent = {
    type: 'dialogue';
    actor: Actor;
    messages: {
        message: string;
        intensity: 'standard' | 'whisper' | 'urgent';
    }[];
};

type ScriptedEvent = ScriptedEventBase & (CharacterAnimationEvent | DialogueEvent);

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
