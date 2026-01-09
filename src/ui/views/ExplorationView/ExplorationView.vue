<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { onMounted, ref } from 'vue';
import { useExploration } from '../../../state/useExploration';
import MapTransition from './MapTransition.vue';

const { explorationEngine } = useGameContext();
const { currentMap, setCurrentMap } = useExploration();

const sceneLoaded = ref(false);
onMounted(() => {
    if (!currentMap.value) {
        setCurrentMap('thurala');
    }
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
