import { Actor } from 'excalibur';
import { ref } from 'vue';
import { useSettings } from './useSettings';

type DialogueMessage = {
    text: string;
    intensity?: 'whisper' | 'standard' | 'shout';
    start?: number;
    tempo?: { start: number; length: number; scale: number }[];
    pauses?: { idx: number; duration: number }[];
    autoAdvance?: number;
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

function getLetterTiming() {
    const textSpeed = useSettings().settingsState.value.textSpeed;
    switch (textSpeed) {
        case 'slow':
            return 72;
        case 'fast':
            return 36;
        case '2x':
            return 18;
        case 'instant':
            return 0;
    }
}

export function useDialogue() {
    return {
        characterLines,
        addCharacterLine,
        getLetterTiming,
    };
}
