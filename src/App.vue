<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import LoadingScreen from './ui/views/Loading/LoadingScreen.vue';
import PauseMenu from './ui/views/PauseMenu/PauseMenu.vue';

import { initGame, useGameContext } from './state/useGameContext';
import { useGameState } from './state/useGameState';
import { useSFX } from './state/useSFX';

import { preloadDbAll } from './state/useDb';
import { LiteLoader } from './resource/loader';
import { sampleSave } from './state/saveState/sampleSave';

const router = useRouter();
const currentRoute = router.currentRoute;

onMounted(() => {
    router.replace({ path: '/' });
    const game = initGame();
    const promises: Promise<void>[] = [];
    promises.push(game.start(new LiteLoader()));
    promises.push(preloadDbAll());
    Promise.all(promises).then(() => {
        const { loadSave } = useGameState();
        loadSave(sampleSave);
        router.replace({ path: '/test' });
    });
});

const dependencies = ref<Record<string, boolean>>({
    sfx: false,
});
const ready = computed(() => !Object.keys(dependencies.value).some((k) => !dependencies.value[k]));
const { paused } = useGameContext();
const { initSFX } = useSFX();
initSFX().then(() => {
    dependencies.value = {
        ...dependencies.value,
        sfx: true,
    };
});
</script>

<template>
    <div class="app size-full bg-bg">
        <canvas id="main-canvas" class="absolute inset-0 z-10 p-1" />
        <audio id="menuNav_SFX" src="Arrow & Bow 202.wav" preload="auto" />
        <div class="absolute inset-0 z-20 pt-1">
            <PauseMenu v-if="paused" />
            <LoadingScreen v-if="!ready" />
            <RouterView :key="currentRoute.fullPath" />
        </div>
    </div>
</template>
