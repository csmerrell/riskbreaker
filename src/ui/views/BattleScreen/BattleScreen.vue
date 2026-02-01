<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { captureControls, unCaptureControls } from '@/game/input/useInput';

const visible = ref(false);
defineExpose({
    setVisible,
});

function setVisible(val: boolean) {
    visible.value = val;
}

watch(visible, (next) => {
    if (next) {
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

onMounted(() => {
    window.addEventListener('resize', updateScale);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateScale);
});

function registerInputListeners() {}

function onBlur() {}

// Compute CSS custom properties
const containerStyles = computed(() => ({
    '--scale': scale.value,
}));
</script>

<template>
    <Transition name="fade" mode="out-in">
        <div v-show="visible" class="absolute inset-0 z-50" :style="containerStyles">
            <div class="z-60 absolute inset-0 bg-bg opacity-75" />
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
