import type { DialogueMarkerKey, MarkerMovement } from '@/game/actors/Markers/DialogueMarker.actor';
import type { CharacterLine } from '@/state/useDialogue';
import type { Actor } from 'excalibur';

export type DialogueEvent = {
    type: 'dialogue';
} & CharacterLine;

export type DialogueMarkerEvent = {
    type: 'dialogueMarker';
    key: DialogueMarkerKey;
    anchor: Actor;
    color?: [number, number, number];
    movement?: MarkerMovement;
};
