<script setup lang="ts">
import HotbarBox from './HotbarBox.vue';
import StyledGamepadIcon from './StyledGamepadIcon.vue';

type Props = {
    focused: boolean;
};

const { focused } = defineProps<Props>();
</script>

<template>
    <div
        class="hotbar-set flex scale-[60%] flex-row items-center gap-1"
        :class="focused ? 'text-[1.5em]' : ''"
    >
        <HotbarBox />
        <div class="flex flex-col items-center gap-2">
            <HotbarBox />
            <StyledGamepadIcon v-if="focused" icon="dpad" class="text-[.5em]" />
            <HotbarBox />
        </div>
        <HotbarBox />
        <div class="mx-1" />
        <HotbarBox />
        <div class="flex flex-col items-center gap-2">
            <HotbarBox />
            <StyledGamepadIcon v-if="focused" icon="faceButtons" class="text-[.5em]" />
            <HotbarBox />
        </div>
        <HotbarBox />
    </div>
</template>
