import type { DialogueEvent, ScriptedEvent } from '../scenes';
import { useDialogue } from '@/state/useDialogue';

export function scriptDialogue(event: ScriptedEvent & DialogueEvent) {
    const { addCharacterLine } = useDialogue();
    addCharacterLine(event);
}
