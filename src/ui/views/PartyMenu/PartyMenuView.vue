<script setup lang="ts">
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { useGameContext } from '@/state/useGameContext';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import MenuBox from '@/ui/components/MenuBox.vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

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

const tabs = ref([
    {
        label: 'Inventory',
        selected: true,
    },
    {
        label: 'Equipment & Appearance',
    },
    {
        label: 'Skills & Specialization',
    },
]);
</script>

<template>
    <div class="fixed inset-0 z-[1000] size-full">
        <div class="relative m-auto h-8 w-11/12">
            <menu-box class="text-standard-md mt-12 h-full skew-x-12 text-white">
                <div class="relative flex h-full -skew-x-12 flex-row items-center justify-center">
                    <div
                        v-for="tab in tabs"
                        :key="tab.label + tab.selected"
                        class="mr-4 flex h-full min-w-64 skew-x-12 flex-row items-center py-0.5 pl-8 pr-12"
                        :class="tab.selected && 'bg-rose-700'"
                    >
                        <span class="-skew-x-12 whitespace-nowrap">
                            {{ tab.label }}
                        </span>
                    </div>
                    <control-icon-sprite
                        command="shoulder_left"
                        class="absolute -left-6 -top-6"
                        size="sm"
                    />
                    <control-icon-sprite
                        command="shoulder_right"
                        class="absolute -right-6 -top-6"
                        size="sm"
                    />
                </div>
            </menu-box>
        </div>
    </div>
</template>
