<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { onMounted, ref } from 'vue';
import { useExploration } from './useExploration';
import MapTransition from './MapTransition.vue';

const { explorationEngine } = useGameContext();
const { setCurrentMap } = useExploration();

const sceneLoaded = ref(false);
onMounted(() => {
    setCurrentMap('thurala');
    explorationEngine.value.goToScene('exploration').then(() => {
        sceneLoaded.value = true;
    });
});
</script>

<template>
    <div class="relative size-full">
        <div id="exploration-container" class="size-full"></div>
        <MapTransition />
    </div>
</template>
