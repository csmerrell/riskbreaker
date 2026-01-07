<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import LoadingScreen from './ui/views/Loading/LoadingScreen.vue';
import PauseMenu from './ui/views/PauseMenu/PauseMenu.vue';

import { initGame, initExplorationEngine, useGameContext } from './state/useGameContext';
import { useSFX } from './state/useSFX';

import { preloadDbAll } from './state/useDb';
import { LiteLoader } from './resource/loader';
import ExplorationCanvas from './ui/views/ExplorationView/ExplorationCanvas.vue';

const router = useRouter();
const currentRoute = router.currentRoute;

onMounted(() => {
    router.replace({ path: '/' });
    const game = initGame();
    const promises: Promise<void>[] = [];
    promises.push(game.start(new LiteLoader()));
    promises.push(preloadDbAll());
    Promise.all(promises).then(() => {
        router.replace({ path: '/title' });
    });
    nextTick(() => {
        initExplorationEngine();
    });
});

const dependencies = ref<Record<string, boolean>>({
    sfx: false,
});
const ready = computed(() => !Object.keys(dependencies.value).some((k) => !dependencies.value[k]));
const { paused, hasFrame } = useGameContext();
const showFrame = ref(true);
hasFrame.subscribe((val) => {
    showFrame.value = val;
});
const { initSFX } = useSFX();
initSFX().then(() => {
    dependencies.value = {
        ...dependencies.value,
        sfx: true,
    };
});

function closeGame() {
    window.electron.quit();
}
function minimizeGame() {
    window.electron.minimize();
}
</script>

<template>
    <div class="app size-full bg-bg">
        <div class="flex size-full flex-col">
            <div
                v-if="showFrame"
                class="flex flex-row items-center justify-start bg-zinc-900 text-white shadow-sm shadow-black"
            >
                <div class="title-bar grow px-4 py-1 hover:bg-blue-500">Riskbreaker</div>
                <span
                    class="picon-minus cursor-pointer p-1 px-4 hover:bg-gray-700 hover:text-white"
                    @click="minimizeGame"
                />
                <span
                    class="picon-close cursor-pointer p-1 px-4 hover:bg-red-700 hover:text-white"
                    @click="closeGame"
                />
            </div>
            <div id="main-container" class="relative grow">
                <canvas id="main-canvas" class="absolute inset-0 z-10 p-1" />
                <div class="absolute inset-0 z-20 pt-1">
                    <PauseMenu v-if="paused" />
                    <LoadingScreen v-if="!ready" />
                    <RouterView :key="currentRoute.fullPath" />
                </div>
                <div id="exploration-ph" class="invisible absolute top-full">
                    <ExplorationCanvas />
                </div>
            </div>
        </div>
        <audio id="menuNav_SFX" src="Arrow & Bow 202.wav" preload="auto" />
    </div>
</template>

<style>
.title-bar {
    -webkit-app-region: drag;
}
</style>
