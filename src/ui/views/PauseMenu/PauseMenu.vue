<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useGameContext } from '@/state/useGameContext';
import ControlLegend from '@/ui/components/ControlLegend.vue';
import MenuBox from '@/ui/components/MenuBox.vue';
import SettingsView from '../SettingsView/SettingsView.vue';
import { useSFX } from '@/state/useSFX';
import { useGameState } from '@/state/useGameState';
import { useRouter } from 'vue-router';
import {
    captureControls,
    unCaptureControls,
    unregisterInputListener,
    registerInputListener,
} from '@/game/input/useInput';

const { togglePause } = useGameContext();

type PauseMenuItem = {
    key: string;
    label: string;
    onSelect: () => void;
};

const router = useRouter();
const { saveGame } = useGameState();
const { playSFX, bufferAudioCb } = useSFX();

const selectedMenuItem = ref(0);
const menuItems = ref<PauseMenuItem[]>([
    {
        key: 'resume',
        label: 'Resume',
        onSelect: () => {
            togglePause();
        },
    },
    {
        key: 'settings',
        label: 'Settings',
        onSelect: () => {
            openSettings();
        },
    },
    {
        key: 'saveTitle',
        label: 'Save & Go to Title',
        onSelect: async () => {
            await saveGame();
            await togglePause();
            router.replace('/title');
        },
    },
    {
        key: 'saveQuit',
        label: 'Save & Quit',
        onSelect: async () => {
            bufferAudioCb('menuBack', async () => {
                await saveGame();
                window.electron.quit();
            });
        },
    },
]);

let cancelPause: string;
let selectMenuItemId: string;
let menuDownId: string;
let menuUpId: string;
onMounted(async () => {
    captureControls();
    cancelPause = registerInputListener(() => {
        togglePause();
    }, ['cancel', 'pause_menu']);
    selectMenuItemId = registerInputListener(selectMenuItem, 'confirm');
    menuDownId = registerInputListener(menuDown, ['movement_down', 'menu_down']);
    menuUpId = registerInputListener(menuUp, ['movement_up', 'menu_up']);
});

onUnmounted(() => {
    onClose();
});

function onClose() {
    unCaptureControls();
    unregisterInputListener(cancelPause);
    unregisterInputListener(selectMenuItemId);
    unregisterInputListener(menuDownId);
    unregisterInputListener(menuUpId);
}

const settingsOpen = ref(false);
function openSettings() {
    bufferAudioCb('menuConfirm', () => {
        settingsOpen.value = true;
    });
}

function closeSettings() {
    bufferAudioCb('menuBack', () => {
        settingsOpen.value = false;
    });
}

function selectMenuItem() {
    menuItems.value[selectedMenuItem.value].onSelect();
}

function menuDown() {
    const curr = selectedMenuItem.value;
    selectedMenuItem.value = Math.min(menuItems.value.length - 1, curr + 1);
    if (selectedMenuItem.value !== curr) {
        playSFX('menuNav');
    }
}

function menuUp() {
    const curr = selectedMenuItem.value;
    selectedMenuItem.value = Math.max(0, curr - 1);
    if (selectedMenuItem.value !== curr) {
        playSFX('menuNav');
    }
}
</script>

<template>
    <div class="absolute inset-0 z-[9999]">
        <div class="mask absolute inset-0 bg-gray-950 opacity-80" />
        <div v-if="!settingsOpen">
            <MenuBox
                :class="[
                    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                    'flex w-96 flex-col bg-bg text-white',
                ]"
            >
                <h1 class="text-standard-lg my-8 text-center">Paused</h1>
                <div class="flex flex-col justify-center gap-2">
                    <div
                        v-for="(item, idx) in menuItems"
                        :key="item.key"
                        :ref="`menu-${item.key}`"
                        class="text-standard-md py-1 text-center"
                        :class="selectedMenuItem === idx && 'menu-select-highlight'"
                    >
                        <div class="relative top-[2px]">
                            {{ item.label }}
                        </div>
                    </div>
                </div>
            </MenuBox>
            <div class="absolute bottom-8 right-16">
                <ControlLegend :commands="[{ key: 'cancel', label: 'Resume' }]" />
            </div>
        </div>
        <div v-else class="">
            <MenuBox
                :class="[
                    'abs-center-x my-8 w-[800px] p-8',
                    'text-standard-md bg-bg-dark text-white shadow-md shadow-bg-dark',
                ]"
            >
                <SettingsView @exit="closeSettings" />
            </MenuBox>
        </div>
    </div>
</template>
