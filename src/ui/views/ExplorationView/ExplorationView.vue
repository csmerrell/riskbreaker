<script setup lang="ts">
import { computed, ref } from 'vue';

import TilePrompts from './TilePrompts.vue';
import HotbarSet from '@/ui/components/menus/crossHotbar/HotbarSet.vue';

import { useInput } from '@/game/input/useInput';
import { useGameContext } from '@/state/useGameContext.js';
import { useExplorationActions } from './useExplorationActions.js';
import { QuadEvents } from '@/ui/components/menus/crossHotbar/HotbarQuad.vue';
import { resources } from '@/resource/index.js';

const { stackOwner } = useInput();

const inputKey = ref();
const inputOwner = ref(stackOwner.value);
stackOwner.subscribe(() => {
    inputOwner.value = stackOwner.value;
});
const hasControl = computed(() => inputOwner.value === inputKey.value);

const activeView = useGameContext().activeView;
const {
    ready: explorationActionsReady,
    dynamicActions,
    getInventoryAction,
} = useExplorationActions();
</script>

<template>
    <div class="relative size-full">
        <TilePrompts v-if="hasControl" />
        <HotbarSet
            v-if="activeView === 'exploration' && explorationActionsReady"
            class="fixed bottom-4 left-4 z-50"
            icon-type="menu"
            :gate-button="'shoulder_left'"
            :quads="['faceButton']"
            :actions="{
                faceButton: dynamicActions as QuadEvents,
            }"
        />
    </div>
</template>
