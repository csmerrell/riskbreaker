<script setup lang="ts">
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { PartyMenuTab, useExploration } from '@/state/useExploration';
import { useGameContext } from '@/state/useGameContext';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import MenuBox from '@/ui/components/MenuBox.vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const { activePartyMemberTab } = useExploration();
const tabs = ref<{ key: PartyMenuTab; label: string }[]>([
    {
        key: 'inventory',
        label: 'Inventory',
    },
    {
        key: 'equipment',
        label: 'Equipment & Appearance',
    },
    {
        key: 'skill',
        label: 'Skills & Specialization',
    },
]);
const selectedTab = ref(tabs.value.findIndex((t) => t.key === activePartyMemberTab.value));

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
    listeners = [...registerShoulders()];
});

onBeforeUnmount(() => {
    listeners.forEach((l) => {
        unregisterInputListener(l);
    });
});
</script>

<template>
    <div class="fixed inset-0 z-[1000] size-full">
        <div class="relative m-auto h-8 w-11/12">
            <menu-box class="text-standard-md mt-12 h-full skew-x-12 text-white">
                <div class="relative flex h-full -skew-x-12 flex-row items-center justify-center">
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
            </menu-box>
        </div>
    </div>
</template>
