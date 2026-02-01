<script setup lang="ts">
import { computed } from 'vue';

import DialogueBubble from './DialogueBubble.vue';

import { type CharacterLine, useDialogue } from '@/state/useDialogue';

const { characterLines } = useDialogue();
const activeLine = computed(() => characterLines.value[0] as CharacterLine);

function popCharacterLine() {
    characterLines.value = [...characterLines.value.slice(1)];
}
</script>

<template>
    <div>
        <DialogueBubble v-if="activeLine" :line="activeLine" @done="popCharacterLine" />
    </div>
</template>
