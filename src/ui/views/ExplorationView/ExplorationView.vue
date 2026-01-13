<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { onMounted, onUnmounted, ref } from 'vue';
import { useExploration } from '../../../state/useExploration';
import MapTransition from './MapTransition.vue';
import ControlLegend from '@/ui/components/ControlLegend.vue';
import BattleScreen from '../BattleScreen/BattleScreen.vue';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';

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

    registerInputListeners();
});

const battleScreen = ref();
let battleDebug: string;
function registerInputListeners() {
    battleDebug = registerInputListener(() => {
        battleScreen.value.setVisible(true);
    }, 'confirm');
}

onUnmounted(() => {
    unregisterInputListener(battleDebug);
});
</script>

<template>
    <div class="relative size-full">
        <div id="exploration-container" class="size-full"></div>
        <BattleScreen ref="battleScreen" />
        <ControlLegend
            class="text-standard-sm absolute bottom-8 right-16"
            :scale="0.5"
            :commands="[
                {
                    key: 'confirm',
                    label: 'Battle Debug',
                },
            ]"
        />
        <MapTransition />
    </div>
</template>
