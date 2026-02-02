<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useExploration } from '../../../state/useExploration';
import MapTransition from './MapTransition.vue';
import { captureControls, useInput } from '@/game/input/useInput';
import TilePrompts from './TilePrompts.vue';
import { useGameContext } from '@/state/useGameContext';
import { useScript } from '@/state/useScript';
import { getScript } from '@/state/scripts';

const { activeView, activeScript } = useGameContext();
const { currentMap, setCurrentMap } = useExploration();
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

onMounted(() => {
    if (!currentMap.value) {
        setCurrentMap('thurala');
    }
});

const battleScreen = ref();
const campScreen = ref();
defineExpose({
    toggleCamp: () => {
        campScreen.value.setVisible(!campScreen.value.visible);
    },
    toggleBattle: () => {
        battleScreen.value.setVisible(!battleScreen.value.visible);
    },
});
</script>

<template>
    <div class="relative size-full">
        <TilePrompts v-if="hasControl" />
        <MapTransition />
    </div>
</template>
