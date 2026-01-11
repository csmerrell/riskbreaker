<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { resolutionMenuItem } from './menuItems/resolution';
import { displayModeMenuItem } from './menuItems/displayMode';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { useRoute, useRouter } from 'vue-router';
import { MenuItemExposed, MenuItemMeta } from './SettingsMenuItemMeta';

import ControlLegend from '@/ui/components/ControlLegend.vue';
import { useSettings } from '@/state/useSettings';
import { MenuItem } from 'electron';

const router = useRouter();

const selectedItem = ref();
const menuItems = [resolutionMenuItem, displayModeMenuItem];
const itemRefs = ref<Record<string, unknown>>({});

onMounted(() => {
    const { disabledSettings } = useSettings();

    for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];
        if (!disabledSettings.value[item.settingKey]) {
            selectedItem.value = i;
            break;
        }
    }
});

function setItemRef(c: unknown, e: MenuItemMeta) {
    itemRefs.value[e.key] = c;
}

const menuDown = registerInputListener(() => {
    let next = Math.min(menuItems.length - 1, selectedItem.value + 1);

    while (
        next < menuItems.length &&
        (itemRefs.value[menuItems[next].key] as MenuItemExposed).isDisabled()
    ) {
        next = Math.min(menuItems.length - 1, next + 1);
    }

    if (!(itemRefs.value[menuItems[next].key] as MenuItemExposed).isDisabled()) {
        selectedItem.value = next;
    }
}, ['movement_down', 'menu_down']);

const menuUp = registerInputListener(() => {
    let next = Math.max(0, selectedItem.value - 1);

    while (next > 0 && (itemRefs.value[menuItems[next].key] as MenuItemExposed).isDisabled()) {
        next = Math.max(0, next - 1);
    }

    if (!(itemRefs.value[menuItems[next].key] as MenuItemExposed).isDisabled()) {
        selectedItem.value = next;
    }
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
    const ref = itemRefs.value[menuItems[selectedItem.value].key] as MenuItemExposed;
    if (ref.isDisabled()) {
        return;
    } else {
        ref.focus?.();
    }
}, ['confirm', 'menu_right', 'movement_right']);

function handleDirectionalExit(e: 'menu_up' | 'menu_down') {
    let ref: MenuItemExposed;
    let found: number;

    if (e === 'menu_up') {
        let next = selectedItem.value - 1;
        while (next > 0 && (itemRefs.value[menuItems[next].key] as MenuItemExposed).isDisabled()) {
            next = Math.max(0, next - 1);
        }
        ref = itemRefs.value[menuItems[next].key] as MenuItemExposed;
        found = next;
    } else {
        let next = selectedItem.value + 1;
        while (
            next < menuItems.length &&
            (itemRefs.value[menuItems[next].key] as MenuItemExposed).isDisabled()
        ) {
            next = Math.min(menuItems.length - 1, next + 1);
        }
        ref = itemRefs.value[menuItems[next].key] as MenuItemExposed;
        found = next;
    }

    if (ref && !ref.isDisabled()) {
        (itemRefs.value[menuItems[selectedItem.value].key] as MenuItemExposed).blur();
        selectedItem.value = found;
        ref.focus();
    }
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
                    class="relative -left-4 top-[2px] mr-16 flex w-48 flex-row px-8 py-[2px]"
                    :class="selectedItem === idx && 'menu-select-highlight'"
                >
                    {{ item.label }}
                </div>
                <component
                    :is="item.component"
                    v-bind="item.componentProps"
                    :ref="(c: unknown) => setItemRef(c, item)"
                    :setting-key="item.settingKey"
                    @directional-exit="handleDirectionalExit"
                />
            </div>
        </div>
        <div
            class="text-standard-md absolute text-white"
            :class="isPage() ? 'bottom-12 right-16' : '-bottom-4 right-8'"
        >
            <ControlLegend :commands="[{ key: 'cancel', label: 'Back' }]" />
        </div>
    </div>
</template>
