<script setup lang="ts">
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { useGameContext } from '@/state/useGameContext';
import { onMounted, onUnmounted, ref, watch } from 'vue';

type MenuItemMeta = {
    key: string;
    label: string;
    onSelect: () => void;
    selected?: boolean;
    disabled?: boolean;
};
const { activeView, activeScript } = useGameContext();
const menuItems = ref<MenuItemMeta[]>([
    {
        key: 'continue',
        label: 'Continue',
        onSelect: () => {
            activeView.value = 'exploration';
        },
    },
    {
        key: 'newGame',
        label: 'New Game',
        onSelect: () => {
            activeView.value = 'exploration';
            activeScript.value = 'unique.intro';
        },
    },
    {
        key: 'settings',
        label: 'Settings',
        onSelect: () => {
            activeView.value = 'settings';
        },
    },
    {
        key: 'quit',
        label: 'Exit Game',
        onSelect: () => {
            window.electron.quit();
        },
    },
]);

const selectedIdx = Math.max(menuItems.value.findIndex((i) => !i.disabled));
menuItems.value[selectedIdx].selected = true;

watch(activeView, (next) => {
    if (next === 'title') {
        registerInputListeners();
    }
});
onMounted(() => {
    if (activeView.value === 'title') {
        registerInputListeners();
    }
});
const listeners: string[] = [];
function registerInputListeners() {
    listeners.push(
        registerInputListener(() => {
            const idx = menuItems.value.findIndex((i) => i.selected);
            let next = Math.min(menuItems.value.length - 1, idx + 1);
            while (next < menuItems.value.length - 1 && menuItems.value[next].disabled) {
                next = Math.min(menuItems.value.length - 1, next + 1);
            }
            const item = menuItems.value[next];
            if (!item.disabled) {
                menuItems.value[idx] = { ...menuItems.value[idx], selected: false };
                menuItems.value[next] = { ...menuItems.value[next], selected: true };
            }
        }, ['menu_down', 'movement_down']),
    );

    listeners.push(
        registerInputListener(() => {
            const idx = menuItems.value.findIndex((i) => i.selected);
            let next = Math.max(0, idx - 1);
            while (next > 0 && menuItems.value[next].disabled) {
                next = Math.max(0, next - 1);
            }
            const item = menuItems.value[next];
            if (!item.disabled) {
                menuItems.value[idx] = { ...menuItems.value[idx], selected: false };
                menuItems.value[next] = { ...menuItems.value[next], selected: true };
            }
        }, ['menu_up', 'movement_up']),
    );

    listeners.push(
        registerInputListener(() => {
            const menuItem = menuItems.value.find((i) => i.selected);
            menuItem.onSelect();
        }, 'confirm'),
    );

    listeners.push(registerInputListener(() => {}, ['pause_menu']));
}

onUnmounted(() => {
    listeners.forEach((l) => unregisterInputListener(l));
});
</script>

<template>
    <div class="flex h-full flex-col items-center text-white">
        <div class="h-[18%]" />
        <h1 class="text-fabled-xl relative">
            Riskbreaker
            <span
                class="text-standard-sm absolute left-full whitespace-nowrap pl-4 tracking-widest text-yellow-100"
            >
                (Alpha v0.0.1)
            </span>
        </h1>
        <div class="text-standard-lg mt-16 flex w-72 flex-col gap-2">
            <div
                v-for="item in menuItems"
                :key="`${item.key}-${item.selected}`"
                class="flex flex-row items-center justify-center gap-3 py-px"
                :class="[
                    item.selected
                        ? 'menu-select-highlight'
                        : item.disabled
                          ? 'text-gray-600'
                          : 'text-gray-200',
                ]"
            >
                <div class="relative top-[3px]">
                    {{ item.label }}
                </div>
            </div>
        </div>
    </div>
</template>
