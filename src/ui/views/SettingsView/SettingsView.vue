<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { resolutionMenuItem } from './menuItems/resolution';
import { displayModeMenuItem } from './menuItems/displayMode';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { useRoute, useRouter } from 'vue-router';
import { MenuItemExposed, MenuItemMeta } from './SettingsMenuItemMeta';
import { useGameContext } from '@/state/useGameContext';

const router = useRouter();

const selectedItem = ref(0);
const menuItems = [resolutionMenuItem, displayModeMenuItem];
const itemRefs = ref<Record<string, unknown>>({});

function setItemRef(c: unknown, e: MenuItemMeta) {
    itemRefs.value[e.key] = c;
}

const menuDown = registerInputListener(() => {
    selectedItem.value = Math.min(menuItems.length - 1, selectedItem.value + 1);
}, ['movement_down', 'menu_down']);

const menuUp = registerInputListener(() => {
    selectedItem.value = Math.max(0, selectedItem.value - 1);
}, ['movement_up', 'menu_up']);

const route = useRoute();
const exitSettings = registerInputListener(() => {
    if (route.path === '/settings') {
        router.replace('/title?selectedKey=settings');
    } else {
        console.warn(
            "TODO - unmount, but don't change navigation (current scene is controlling this menu.",
        );
    }
}, 'cancel');

const enterSetting = registerInputListener(() => {
    const ref = itemRefs.value[menuItems[selectedItem.value].key];
    (ref as MenuItemExposed).focus?.();
}, ['confirm', 'menu_right', 'movement_right']);

function handleDirectionalExit(e: 'menu_up' | 'menu_down') {
    if (e === 'menu_up') {
        selectedItem.value = Math.max(0, selectedItem.value - 1);
    } else {
        selectedItem.value = Math.min(menuItems.length - 1, selectedItem.value + 1);
    }
    const ref = itemRefs.value[menuItems[selectedItem.value].key];
    (ref as MenuItemExposed).focus?.();
}

const disablePause = registerInputListener(() => {}, ['pause_menu']);
function unregisterInputListeners() {
    unregisterInputListener(menuDown);
    unregisterInputListener(menuUp);
    unregisterInputListener(exitSettings);
    unregisterInputListener(enterSetting);
    unregisterInputListener(disablePause);
}
onUnmounted(unregisterInputListeners);
</script>

<template>
    <div class="w-full">
        <div class="text-standard-xl mt-8 flex flex-row justify-center text-white">Settings</div>
        <div
            class="justify-left text-standard-md flex w-full flex-col items-center gap-4 px-8 py-4 tracking-wide text-white"
        >
            <div
                v-for="(item, idx) in menuItems"
                :key="item.key"
                class="flex w-full items-center justify-start"
            >
                <div
                    class="mr-16 flex w-48 flex-row"
                    :class="selectedItem === idx && 'text-rose-700'"
                >
                    <span class="pr-2" :class="selectedItem !== idx && 'invisible'">></span>
                    {{ item.label }}
                </div>
                <component
                    :is="item.component"
                    v-bind="item.componentProps"
                    :ref="(c: unknown) => setItemRef(c, item)"
                    @directional-exit="handleDirectionalExit"
                />
            </div>
        </div>
    </div>
</template>
