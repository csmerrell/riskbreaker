import { Actor } from 'excalibur';
import { ref } from 'vue';

type DialogueMessage = {
    text: string;
    intensity?: 'whisper' | 'standard' | 'shout';
    start?: number;
    tempo?: { start: number; length: number; scale: number }[];
    pauses?: { idx: number; duration: number }[];
};
export type CharacterLine = {
    actor: Actor;
    messages: DialogueMessage[];
    persistDelay?: number;
    xBias?: 'left' | 'right';
    yBias?: 'top' | 'bottom';
};
const characterLines = ref<CharacterLine[]>([]);
function addCharacterLine(line: CharacterLine) {
    characterLines.value = [...characterLines.value, line];
}

export function useDialogue() {
    return {
        characterLines,
        addCharacterLine,
    };
}
