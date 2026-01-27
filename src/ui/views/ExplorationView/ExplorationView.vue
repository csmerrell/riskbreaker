<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useExploration } from '../../../state/useExploration';
import MapTransition from './MapTransition.vue';
import BattleScreen from '../BattleScreen/BattleScreen.vue';
import {
    captureControls,
    registerInputListener,
    unregisterInputListener,
    useInput,
} from '@/game/input/useInput';
import TilePrompts from './TilePrompts.vue';
import CampScreen from '../CampScreen/CampScreen.vue';

const { explorationEngine } = useGameContext();
const { currentMap, campOpen, setCurrentMap } = useExploration();
const { stackOwner } = useInput();

const inputKey = captureControls('ExplorationRoot');
const inputOwner = ref(stackOwner.value);
stackOwner.subscribe(() => {
    inputOwner.value = stackOwner.value;
});
const hasControl = computed(() => inputOwner.value === inputKey);

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

const campScreen = ref();
campOpen.subscribe((next) => {
    if (next) {
        campScreen.value.setVisible(true);
    }
});

onUnmounted(() => {
    unregisterInputListener(battleDebug);
});
</script>

<template>
    <div class="relative size-full">
        <div id="exploration-container" class="size-full"></div>
        <BattleScreen ref="battleScreen" />
        <CampScreen ref="campScreen" />
        <TilePrompts v-if="hasControl" />
        <MapTransition />
    </div>
</template>
