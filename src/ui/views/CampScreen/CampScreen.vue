<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { computed, ref, watch } from 'vue';
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
    useInput,
} from '@/game/input/useInput';
import { useGameContext } from '@/state/useGameContext';

const { campEngine } = useGameContext();
const visible = ref(false);
defineExpose({
    setVisible,
});

function setVisible(val: boolean) {
    visible.value = val;
}

const { stackOwner } = useInput();
const inputKey = 'CampScreenRoot';
const inputOwner = ref(stackOwner.value);
stackOwner.subscribe((next) => {
    inputOwner.value = next;
});
const _hasControl = computed(() => inputOwner.value === inputKey);
watch(visible, (next) => {
    if (next) {
        campEngine.value.goToScene('camp');
        captureControls(inputKey);
        registerInputListeners();
    } else {
        onBlur();
        unCaptureControls();
    }
});

// Make scale reactive to window resizes
const scale = ref(getScale());

let closeCamp: string;
function registerInputListeners() {
    closeCamp = registerInputListener(() => {
        setVisible(false);
        onBlur();
    }, 'pause_menu');
}

function onBlur() {
    unregisterInputListener(closeCamp);
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
            <div id="camp-container" class="z-100 absolute inset-0" />
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
