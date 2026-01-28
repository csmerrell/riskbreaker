<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import LoadingScreen from './ui/views/Loading/LoadingScreen.vue';
import PauseMenu from './ui/views/PauseMenu/PauseMenu.vue';
import ExplorationCanvas from './ui/views/ExplorationView/ExplorationCanvas.vue';

import { initGame, initEngine, useGameContext } from './state/useGameContext';
import { useSFX } from './state/useSFX';

import { LiteLoader } from './resource/loader';
import { useSprites } from './state/useSprites';
import { useGameState } from './state/useGameState';
import SFXDriver from './ui/components/SFXDriver.vue';
import BattleCanvas from './ui/views/BattleScreen/BattleCanvas.vue';
import { useShader } from './state/useShader';
import CampCanvas from './ui/views/CampScreen/CampCanvas.vue';

const { loadSave } = useGameState();
const { initShaders } = useShader();

const router = useRouter();
const currentRoute = router.currentRoute;

onMounted(() => {
    router.replace({ path: '/' });
    const game = initGame();
    const promises: Promise<void | void[]>[] = [];
    promises.push(game.start(new LiteLoader()));
    promises.push(loadSave());
    useSprites().loadAllSprites();

    Promise.all(promises).then(() => {
        router.replace({ path: '/title' });
    });
    nextTick(() => {
        Promise.all([initEngine('exploration'), initEngine('battle'), initEngine('camp')]).then(
            () => {
                initShaders();
            },
        );
    });
});

const dependencies = ref<Record<string, boolean>>({
    sfx: false,
});
const ready = computed(() => !Object.keys(dependencies.value).some((k) => !dependencies.value[k]));
const { paused, hasFrame } = useGameContext();
const showFrame = ref(true);
hasFrame.subscribe((val) => {
    showFrame.value = false;
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
    <div class="app size-full overflow-hidden bg-bg">
        <div class="flex size-full flex-col">
            <div
                v-if="false"
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
                <div class="absolute inset-0 z-20">
                    <PauseMenu v-if="paused && ready" />
                    <LoadingScreen v-if="!ready" />
                    <RouterView :key="currentRoute.fullPath" />
                </div>
                <div id="exploration-ph" class="invisible absolute inset-x-0 top-full h-full">
                    <ExplorationCanvas />
                </div>
                <div id="battle-ph" class="invisible absolute inset-x-0 top-full h-full">
                    <BattleCanvas />
                </div>
                <div id="camp-ph" class="invisible absolute inset-x-0 top-full h-full">
                    <CampCanvas />
                </div>
            </div>
        </div>
        <SFXDriver />
    </div>
</template>

<style>
.title-bar {
    -webkit-app-region: drag;
}
</style>
