<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
    getCurrentOwner,
    registerInputListener,
    unregisterInputListener,
} from '@/game/input/useInput';
import { PartyMenuTab, useExploration } from '@/state/useExploration';

import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import MenuBox from '@/ui/components/MenuBox.vue';
import SpecializationView from './SpecializationView.vue';
import LoadoutView from './LoadoutView.vue';
import InventoryView from './InventoryView.vue';
import NightSkyRender from './NightSkyRender.vue';

const { activePartyMemberTab } = useExploration();
const tabs = ref<{ key: PartyMenuTab; label: string }[]>([
    {
        key: 'inventory',
        label: 'Inventory',
    },
    {
        key: 'loadout',
        label: 'Loadout',
    },
    {
        key: 'skill',
        label: 'Specialization',
    },
]);
const selectedTab = ref(tabs.value.findIndex((t) => t.key === activePartyMemberTab.value));
const activeTabName = computed(() => {
    return tabs.value.find((t, idx) => idx === selectedTab.value)!.key;
});

let listeners: string[] = [];
const registerShoulders = () => {
    return [
        registerInputListener(() => {
            let idx = selectedTab.value - 1;
            if (idx < 0) {
                idx = tabs.value.length - 1;
            }
            selectedTab.value = idx;
            activePartyMemberTab.value = tabs.value[selectedTab.value].key;
        }, 'shoulder_left'),
        registerInputListener(() => {
            let idx = selectedTab.value + 1;
            if (idx >= tabs.value.length) {
                idx = 0;
            }
            selectedTab.value = idx;
            activePartyMemberTab.value = tabs.value[selectedTab.value].key;
        }, 'shoulder_right'),
    ];
};

onMounted(() => {
    console.log(`Registered shoulders under ${getCurrentOwner()}`);
    listeners = [...registerShoulders()];
});

onBeforeUnmount(() => {
    listeners.forEach((l) => {
        unregisterInputListener(l);
    });
});
</script>

<template>
    <div class="fixed inset-0 z-[1000] flex size-full flex-col justify-start gap-4">
        <div class="relative mx-auto mt-12 h-8 w-11/12 basis-8">
            <menu-box class="text-standard-md h-full skew-x-12 text-white">
                <div class="relative size-full">
                    <div class="absolute inset-x-4 inset-y-0 bg-bg opacity-90" />
                    <div
                        class="absolute inset-0 flex -skew-x-12 flex-row items-center justify-center"
                    >
                        <div
                            v-for="(tab, idx) in tabs"
                            :key="tab.label + (selectedTab === idx)"
                            class="mr-4 flex h-full min-w-64 skew-x-12 flex-row items-center py-0.5 pl-8 pr-12"
                            :class="selectedTab === idx && 'bg-rose-700'"
                        >
                            <span class="-skew-x-12 whitespace-nowrap">
                                {{ tab.label }}
                            </span>
                        </div>
                        <control-icon-sprite
                            command="shoulder_left"
                            class="absolute -left-6 top-[-1.575rem]"
                            size="sm"
                        />
                        <control-icon-sprite
                            command="shoulder_right"
                            class="absolute -right-5 top-[-1.575rem]"
                            size="sm"
                        />
                    </div>
                </div>
            </menu-box>
        </div>
        <div class="w-11/12 grow self-center">
            <loadout-view v-if="activeTabName === 'loadout'" />
            <specialization-view v-else-if="activeTabName === 'skill'" />
            <inventory-view v-else-if="activeTabName === 'inventory'" />
        </div>

        <night-sky-render :active-tab-name />
    </div>
</template>
