import { useDialogue } from '@/state/useDialogue';
import { watch } from 'vue';
import type { DialogueEvent, DialogueMarkerEvent } from '../scenes/types/Dialogue';
import type { ScriptedEvent } from '../scenes';
import { DialogueMarker } from '@/game/actors/Markers/DialogueMarker.actor';

function isDialogueEvent(event: ScriptedEvent): event is DialogueEvent {
    return event.type === 'dialogue';
}

function isDialogueMarkerEvent(event: ScriptedEvent): event is DialogueMarkerEvent {
    return event.type === 'dialogueMarker';
}

export function scriptDialogue(event: ScriptedEvent & (DialogueEvent | DialogueMarkerEvent)) {
    if (isDialogueEvent(event)) {
        return scriptDialogueEvent(event);
    } else if (isDialogueMarkerEvent(event)) {
        return scriptDialogueMarker(event);
    }
}

function scriptDialogueEvent(event: ScriptedEvent & DialogueEvent) {
    const { addCharacterLine } = useDialogue();
    addCharacterLine(event);
    return new Promise<void>((resolve) => {
        const { characterLines } = useDialogue();
        watch(characterLines, () => {
            if (characterLines.value.length === 0) {
                resolve();
            }
        });
    });
}

function scriptDialogueMarker(event: ScriptedEvent & DialogueMarkerEvent) {
    const { key, color, movement, anchor } = event;
    const marker = new DialogueMarker({
        key,
        anchorEntity: anchor,
        swapColor: color,
        movement,
    });

    return Promise.reject('[Dialogue Marker] Not implemented yet');
}
