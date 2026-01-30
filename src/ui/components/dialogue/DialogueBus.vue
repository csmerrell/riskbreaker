<script setup lang="ts">
import { ref, watch } from 'vue';

import DialogueBubble from './DialogueBubble.vue';

import { type CharacterLine, useDialogue } from '@/state/useDialogue';

const { characterLines } = useDialogue();
const activeLine = ref<CharacterLine>();

watch(characterLines, () => {
    if (!activeLine.value && characterLines.value.length > 0) {
        activeLine.value = characterLines.value.shift() as CharacterLine;
    }
});
</script>

<template>
    <div>
        <DialogueBubble v-if="activeLine" :line="activeLine" />
    </div>
</template>
