<script setup lang="ts">
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { getScale } from '@/lib/helpers/screen.helper';
import { useExploration } from '@/state/useExploration';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import { useIcons } from '@/ui/components/menus/crossHotbar/useIcons';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const allIcons = ref<{ key: 'inventory' | 'loadout' | 'skill'; icon: HTMLImageElement }[]>([]);
const focused = computed(() => {
    return allIcons.value.find((i) => i.key === useExploration().activePartyMemberTab.value);
});
const subFocused = computed(() => {
    return allIcons.value.filter((i) => i.key !== useExploration().activePartyMemberTab.value);
});
let listeners: string[] = [];
onMounted(async () => {
    const [invIcon, equipIcon, skillIcon] = await Promise.all([
        useIcons().getMenuIcon(7, 0),
        useIcons().getMenuIcon(6, 0),
        useIcons().getMenuIcon(5, 0),
    ]);
    allIcons.value = [
        {
            key: 'inventory',
            icon: invIcon,
        },
        {
            key: 'skill',
            icon: skillIcon,
        },
        {
            key: 'loadout',
            icon: equipIcon,
        },
    ];

    listeners = [
        registerInputListener(() => {
            useExploration().getExplorationManager().actorManager.getLeader().fadeOut();
            captureControls();
            registerInputListener(() => {
                useExploration().getExplorationManager().actorManager.getLeader().fadeIn();
                unCaptureControls();
            }, 'cancel');
            // useExploration().getExplorationManager().partyMenuManager.open();
        }, 'context_menu_1'),
    ];
});

onBeforeUnmount(() => {
    listeners.forEach((l) => {
        unregisterInputListener(l);
    });
});
</script>

<template>
    <div class="relative">
        <div v-if="focused?.icon" class="absolute top-0 z-10 flex w-full flex-row gap-2">
            <img
                :src="subFocused[0]?.icon.src"
                :style="{
                    width: `${(getScale() - 3) * 32}px`,
                    height: `${(getScale() - 3) * 32}px`,
                }"
            />
            <img
                :src="subFocused[1]?.icon.src"
                :style="{
                    width: `${(getScale() - 3) * 32}px`,
                    height: `${(getScale() - 3) * 32}px`,
                }"
            />
        </div>
        <div class="mt-4 px-3">
            <div
                class="relative"
                :style="{
                    width: `${(getScale() - 2) * 32}px`,
                    height: `${(getScale() - 2) * 32}px`,
                }"
            >
                <img
                    v-if="focused?.icon"
                    :src="focused?.icon.src"
                    :style="{
                        width: `${(getScale() - 2) * 32}px`,
                        height: `${(getScale() - 2) * 32}px`,
                    }"
                    class="focused-icon-bg absolute left-0 top-0 z-20"
                />
            </div>
        </div>
        <ControlIconSprite
            command="context_menu_1"
            class="absolute -right-6 -top-1 z-30"
            size="sm"
        />
    </div>
</template>

<style scoped>
.focused-icon-bg {
    background: radial-gradient(
        circle,
        rgba(21, 29, 40, 1) 0%,
        rgba(21, 29, 40, 0.6) 70%,
        rgba(21, 29, 40, 0) 100%
    );
}
</style>
