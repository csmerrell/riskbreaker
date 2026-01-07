<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { onMounted, ref } from 'vue';

const { explorationEngine } = useGameContext();

const sceneLoaded = ref(false);
onMounted(() => {
    explorationEngine.value.goToScene('exploration').then(() => {
        sceneLoaded.value = true;
    });
});
</script>

<template>
    <div id="exploration-container" class="relative size-full"></div>
</template>
