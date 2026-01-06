<script setup lang="ts">
import { ExplorationScene } from '@/game/scenes/exploration.scene';
import { gameEnum } from '@/lib/enum/game.enum';
import { LiteLoader } from '@/resource/loader';
import { Color, DisplayMode, Engine } from 'excalibur';
import { onMounted, ref } from 'vue';

const loader = new LiteLoader();
const explorationEngine = ref<Engine>();
function initExplorationEngine() {
    explorationEngine.value = new Engine<'exploration'>({
        canvasElementId: 'map-anchor',
        pixelArt: true,
        pixelRatio: 2,
        width: gameEnum.nativeWidth,
        height: gameEnum.nativeHeight,
        enableCanvasTransparency: true,
        backgroundColor: Color.Transparent,
        displayMode: DisplayMode.FitContainer,
        suppressPlayButton: true,
        antialiasing: false,
        scenes: {
            exploration: {
                scene: ExplorationScene,
                loader: loader,
            },
        },
    });

    explorationEngine.value.start(new LiteLoader());
    return explorationEngine.value.goToScene('exploration');
}

const sceneLoaded = ref(false);
onMounted(() => {
    initExplorationEngine().then(() => {
        sceneLoaded.value = true;
    });
});
</script>

<template>
    <div ref="container" class="relative size-full">
        <canvas id="map-anchor" class="absolute inset-0 z-10 p-1" />
    </div>
</template>
