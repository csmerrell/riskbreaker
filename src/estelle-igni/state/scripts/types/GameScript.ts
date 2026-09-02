import type { CharacterAnimationEvent, UniqueAnimationEvent } from './CharacterAnimation';
import type { DialogueEvent, DialogueMarkerEvent } from './Dialogue';

export type ScriptedEventBase = {
    type: 'dialogue' | 'dialogueMarker' | 'compositeAnimation' | 'uniqueAnimation';
    endSignal?: 'playerConfirm' | 'animationEnd' | 'actorFrame';
    preDelay?: number;
    postDelay?: number;
};

export type ScriptedEvent = ScriptedEventBase &
    (CharacterAnimationEvent | UniqueAnimationEvent | DialogueEvent | DialogueMarkerEvent);

type ScriptEventArg = (() => Promise<void>) | ScriptedEvent | ScriptedEvent[];
export type GameScript = {
    events: ScriptEventArg[];
};

export function isTypedEvent(e: ScriptEventArg): e is ScriptedEvent {
    return !(typeof e === 'function') && !Array.isArray(e) && e.type !== undefined;
}

export function isTypedEventArray(e: ScriptEventArg): e is ScriptedEvent[] {
    return !(typeof e === 'function') && Array.isArray(e);
}

export function isUntypedEvent(e: ScriptEventArg): e is () => Promise<void> {
    return typeof e === 'function';
}
