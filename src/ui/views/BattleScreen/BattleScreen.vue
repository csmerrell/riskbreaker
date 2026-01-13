<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { useGameContext } from '@/state/useGameContext';

const { battleEngine } = useGameContext();
const visible = ref(false);
defineExpose({
    setVisible,
});

function setVisible(val: boolean) {
    visible.value = val;
}

watch(visible, (next) => {
    if (next) {
        battleEngine.value.goToScene('battle');
        captureControls();
        registerInputListeners();
    } else {
        onBlur();
        unCaptureControls();
    }
});

// Make scale reactive to window resizes
const scale = ref(getScale());

const updateScale = () => {
    scale.value = getScale();
};

// const laneTilesRef = ref();
// type LaneKeys = 'left' | 'leftMid' | 'mid' | 'rightMid' | 'right';
// const laneTargets: LaneKeys[] = ['left', 'leftMid', 'mid', 'rightMid', 'right'];
// const targetMap: Record<LaneKeys, number> = laneTargets.reduce(
//     (acc, lane: LaneKeys, idx) => {
//         return { ...acc, [lane]: idx };
//     },
//     {} as Record<LaneKeys, number>,
// );

onMounted(() => {
    window.addEventListener('resize', updateScale);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateScale);
});

let cancelBattle: string;
function registerInputListeners() {
    cancelBattle = registerInputListener(() => {
        setVisible(false);
        onBlur();
    }, 'cancel');
}

function onBlur() {
    unregisterInputListener(cancelBattle);
}

// Compute CSS custom properties
const containerStyles = computed(() => ({
    '--scale': scale.value,
}));
</script>

<template>
    <Transition name="fade" mode="out-in">
        <div v-show="visible" class="absolute inset-0 z-50" :style="containerStyles">
            <div class="z-60 absolute inset-0 bg-bg opacity-75" />
            <div id="battle-container" class="z-100 absolute inset-0" />
        </div>
    </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 250ms ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
