<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';
import HotbarSet from './HotbarSet.vue';
import { resources } from '@/resource';
import {
    registerHoldListener,
    registerInputListener,
    unregisterInputListener,
} from '@/game/input/useInput';
import { targetEnemy } from '@/state/battle/actions/targetEnemy';

const ready = ref(false);
const focusLeft = ref(false);
const focusRight = ref(false);
const listeners: string[] = [];
if (resources.image.icons.skills.isLoaded()) {
    ready.value = true;
    registerListeners();
} else {
    resources.image.icons.skills.load().then(() => {
        ready.value = true;
        registerListeners();
    });
}

let nestedListeners: string[] = [];
function registerListeners() {
    listeners.push(
        registerHoldListener((inputs) => {
            if (inputs.shoulder_right && !focusLeft.value) {
                focusRight.value = true;
                nestedListeners = registerRightHotbarListeners();
            } else if (inputs.shoulder_left && !focusRight.value) {
                nestedListeners = registerLeftHotbarListeners();
                focusLeft.value = true;
            } else {
                nestedListeners.forEach((l) => unregisterInputListener(l));
                focusLeft.value = false;
                focusRight.value = false;
            }
        }),
    );
}

function registerRightHotbarListeners() {
    return [
        registerInputListener(() => {
            targetEnemy();
        }, 'hotbarFDown'),
    ];
}

function registerLeftHotbarListeners() {
    return [];
}

onUnmounted(() => {
    listeners.forEach((l) => unregisterInputListener(l));
});
</script>

<template>
    <div
        v-if="ready"
        class="cross-hotbar flex -translate-x-1/2 -translate-y-full flex-row items-end justify-end gap-4 self-center rounded-lg p-4"
    >
        <HotbarSet side="left" :focused="focusLeft" :class="focusRight ? 'text-[.75em]' : ''" />
        <div class="h-16 border-l border-bg-alt" />
        <HotbarSet side="right" :focused="focusRight" :class="focusLeft ? 'text-[.75em]' : ''" />
    </div>
</template>
