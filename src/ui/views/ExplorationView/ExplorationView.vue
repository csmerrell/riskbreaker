<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { captureControls, useInput } from '@/game/input/useInput';
import TilePrompts from './TilePrompts.vue';
import { useGameContext } from '@/state/useGameContext';
import { useScript } from '@/state/useScript';
import { getScript } from '@/state/scripts';

const { activeView, activeScript } = useGameContext();
const { stackOwner } = useInput();

const inputKey = ref();
watch(activeView, (next) => {
    if (next === 'exploration') {
        inputKey.value = captureControls('ExplorationRoot');
        useGameContext()
            .game.value.goToScene('exploration')
            .then(() => {
                if (activeScript.value) {
                    const { runScript } = useScript();
                    runScript(getScript(activeScript.value));
                }
            });
    }
});
const inputOwner = ref(stackOwner.value);
stackOwner.subscribe(() => {
    inputOwner.value = stackOwner.value;
});
const hasControl = computed(() => inputOwner.value === inputKey.value);
</script>

<template>
    <div class="relative size-full">
        <TilePrompts v-if="hasControl" />
    </div>
</template>
