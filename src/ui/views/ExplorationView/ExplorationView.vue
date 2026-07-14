<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import TilePrompts from './TilePrompts.vue';
import HotbarSet from '@/ui/components/menus/crossHotbar/HotbarSet.vue';

import { useInput } from '@/game/input/useInput';
import { useGameContext } from '@/state/useGameContext.js';
import { useExplorationActions } from './useExplorationActions.js';
import { QuadEvents } from '@/ui/components/menus/crossHotbar/HotbarQuad.vue';
import { resources } from '@/resource/index.js';
import { useIcons } from '@/ui/components/menus/crossHotbar/useIcons.js';
import ExplorationAction from './ExplorationAction.vue';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import MenuBox from '@/ui/components/MenuBox.vue';

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

const dynamicActionEl = ref<InstanceType<typeof HotbarSet>>();
const dynamicActionSize = ref({ x: '0px', y: '0px' });
const pollDynamicActionSize = () => {
    dynamicActionSize.value = {
        x: `${dynamicActionEl.value?.$el?.children[0].getBoundingClientRect().width ?? 0}px`,
        y: `${dynamicActionEl.value?.$el?.children[0].getBoundingClientRect().height ?? 0}px`,
    };
    if (activeView.value === 'exploration') {
        requestAnimationFrame(pollDynamicActionSize);
    }
};

watch(activeView, () => {
    if (activeView.value === 'exploration') {
        requestAnimationFrame(pollDynamicActionSize);
    }
});
</script>

<template>
    <div class="relative size-full">
        <TilePrompts v-if="hasControl" />
        <div
            v-if="activeView === 'exploration' && explorationActionsReady"
            class="fixed bottom-4 left-4 z-50 flex flex-row items-end gap-4"
        >
            <div
                class="relative"
                :style="{ width: dynamicActionSize.x, height: dynamicActionSize.y }"
            >
                <HotbarSet
                    ref="dynamicActionEl"
                    class="origin-bottom-left"
                    icon-type="menu"
                    :gate-button="'shoulder_right'"
                    :quads="['faceButton']"
                    :actions="{
                        faceButton: dynamicActions as QuadEvents,
                    }"
                />
                <ControlIconSprite
                    class="absolute right-0 top-0"
                    command="shoulder_right"
                    size="sm"
                />
            </div>
            <ExplorationAction :action="getInventoryAction()" command="context_menu_1" />
        </div>
    </div>
</template>
