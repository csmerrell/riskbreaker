<script setup lang="ts">
import { HotbarActionSet } from '../state/useCrossHotbar';
import HotbarBox from './HotbarBox.vue';
import StyledGamepadIcon from './StyledGamepadIcon.vue';

type Props = {
    focused: boolean;
    actions: HotbarActionSet;
};

const { actions, focused } = defineProps<Props>();
</script>

<template>
    <div
        class="hotbar-set flex scale-75 flex-row items-center gap-1"
        :class="focused ? 'text-[1.25em]' : ''"
    >
        <HotbarBox :action="actions.hotbarDLeft" :focused />
        <div class="flex flex-col items-center gap-2">
            <HotbarBox :action="actions.hotbarDUp" :focused />
            <StyledGamepadIcon v-if="focused" icon="dpad" class="text-[.5em]" />
            <HotbarBox :action="actions.hotbarDDown" :focused />
        </div>
        <HotbarBox :action="actions.hotbarDRight" :focused />
        <div class="mx-1" />
        <HotbarBox :action="actions.hotbarFLeft" :focused />
        <div class="flex flex-col items-center gap-2">
            <HotbarBox :action="actions.hotbarFUp" :focused />
            <StyledGamepadIcon v-if="focused" icon="faceButtons" class="text-[.5em]" />
            <HotbarBox :action="actions.hotbarFDown" :focused />
        </div>
        <HotbarBox :action="actions.hotbarFRight" :focused />
    </div>
</template>
