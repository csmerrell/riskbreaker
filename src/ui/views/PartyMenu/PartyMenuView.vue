<script setup lang="ts">
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { useGameContext } from '@/state/useGameContext';
import { onBeforeUnmount, onMounted } from 'vue';

let listeners: string[] = [];
onMounted(() => {
    captureControls();

    listeners = [
        registerInputListener(() => {
            const { activeView } = useGameContext();
            activeView.value = 'exploration';
        }, 'cancel'),
    ];
});

onBeforeUnmount(() => {
    listeners.forEach((l) => {
        unregisterInputListener(l);
    });
    unCaptureControls();
});
</script>

<template>
    <div class="fixed inset-0 z-[1000] size-full">
        <h1 class="text-standard-xl absolute left-1/2 top-1/4 -translate-x-1/2 text-white">
            PARTY MENU
        </h1>
    </div>
</template>
