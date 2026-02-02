<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';

import LoadingScreen from './ui/views/Loading/LoadingScreen.vue';
import PauseMenu from './ui/views/PauseMenu/PauseMenu.vue';
import DialogueBus from './ui/components/dialogue/DialogueBus.vue';
import ExplorationView from './ui/views/ExplorationView/ExplorationView.vue';
import TitleScreen from './ui/views/TitleScreen/TitleScreen.vue';

import { initGame, useGameContext } from './state/useGameContext';
import { useSFX } from './state/useSFX';

import { LiteLoader } from './resource/loader';
import { useSprites } from './state/useSprites';
import { useGameState } from './state/useGameState';
import SFXDriver from './ui/components/SFXDriver.vue';
import { useShader } from './state/useShader';
import SettingsView from './ui/views/SettingsView/SettingsView.vue';
import { loadAllMaps, loadAllResources, resources } from './resource';

const { loadSave } = useGameState();
const { initShaders } = useShader();

const dependencies = ref<Record<string, boolean>>({
    game: false,
    sfx: false,
});
const ready = computed(() => !Object.keys(dependencies.value).some((k) => !dependencies.value[k]));
onMounted(() => {
    const game = initGame();
    const promises: Promise<void | void[]>[] = [];
    promises.push(game.start(new LiteLoader()));
    promises.push(loadSave());
    useSprites().loadAllSprites();

    Promise.all(promises).then(async () => {
        await nextTick(() => {
            initShaders();
            loadAllResources(resources);
            loadAllMaps();
        });
        dependencies.value = {
            ...dependencies.value,
            game: true,
        };
    });
});

const { activeView, paused, hasFrame } = useGameContext();
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
                <div class="absolute inset-0 z-20">
                    <div class="relative size-full bg-bg">
                        <LoadingScreen v-if="!ready" />
                        <div v-show="ready">
                            <div class="mask absolute inset-0 z-10 bg-bg" />
                            <canvas id="main-canvas" class="absolute inset-0 z-20 p-1" />
                            <TitleScreen
                                class="absolute inset-0"
                                :class="activeView === 'title' && 'z-30'"
                            />
                            <SettingsView
                                class="absolute inset-0"
                                :class="activeView === 'settings' && 'z-30'"
                                @exit="activeView = 'title'"
                            />
                            <ExplorationView
                                class="absolute inset-0"
                                :class="activeView === 'exploration' && 'z-30'"
                            />
                        </div>
                        <PauseMenu v-if="paused" />
                    </div>
                </div>
            </div>
        </div>
        <DialogueBus />
        <SFXDriver />
    </div>
</template>

<style>
.title-bar {
    -webkit-app-region: drag;
}
</style>
