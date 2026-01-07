<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useGameContext } from '@/state/useGameContext';
import ControlLegend from '@/ui/components/ControlLegend.vue';
import MenuBox from '@/ui/components/MenuBox.vue';
import SettingsView from '../SettingsView/SettingsView.vue';

const { game, togglePause } = useGameContext();

const modalOpen = ref(false);

let cancelPause: string;
let btnSettings: string;
onMounted(async () => {
    if (game.value.isReady) {
        const { captureControls, registerInputListener } = await import('@/game/input/useInput');
        captureControls();
        cancelPause = registerInputListener(togglePause, ['cancel', 'pause_menu']);
        btnSettings = registerInputListener(() => {
            openSettings();
        }, 'context_menu_2');
    }
});

onUnmounted(async () => {
    if (game.value.isReady) {
        const { unCaptureControls, unregisterInputListener } = await import(
            '@/game/input/useInput'
        );
        unCaptureControls();
        unregisterInputListener(cancelPause);
        unregisterInputListener(btnSettings);
    }
});

function openSettings() {
    modalOpen.value = true;
}
</script>

<template>
    <div class="absolute inset-0 z-[9999]">
        <div class="mask absolute inset-0 bg-gray-950 opacity-80" />
        <div v-if="!modalOpen">
            <div
                :class="[
                    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                    'text-standard-lg text-white',
                ]"
            >
                Paused
            </div>
            <div class="absolute bottom-8 right-16">
                <ControlLegend
                    :commands="[
                        { key: 'context_menu_2', label: 'Settings' },
                        { key: 'cancel', label: 'Resume' },
                    ]"
                />
            </div>
        </div>
        <div v-else class="">
            <MenuBox
                :class="[
                    'abs-center-x my-8 w-[800px] p-8',
                    'text-standard-md bg-bg-dark text-white shadow-md shadow-bg-dark',
                ]"
            >
                <SettingsView @exit="modalOpen = false" />
            </MenuBox>
        </div>
    </div>
</template>
