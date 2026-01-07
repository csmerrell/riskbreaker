<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { resolutionMenuItem } from './menuItems/resolution';
import { displayModeMenuItem } from './menuItems/displayMode';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { useRoute, useRouter } from 'vue-router';
import { MenuItemExposed, MenuItemMeta } from './SettingsMenuItemMeta';

import ControlLegend from '@/ui/components/ControlLegend.vue';

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
function isPage() {
    return route.path === '/settings';
}
const emit = defineEmits(['exit']);
const exitSettings = registerInputListener(() => {
    if (isPage()) {
        router.replace('/title?selectedKey=settings');
    } else {
        emit('exit');
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
    <div class="relative size-full">
        <div
            class="text-standard-xl flex flex-row justify-center text-white"
            :class="isPage() && 'mt-8'"
        >
            Settings
        </div>
        <div
            class="justify-left text-standard-md flex w-full flex-col items-center gap-4 py-4 tracking-wide text-white"
            :class="isPage() && 'px-8'"
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
        <div class="absolute -bottom-4 right-8">
            <ControlLegend :commands="[{ key: 'cancel', label: 'Back' }]" />
        </div>
    </div>
</template>
