<script setup lang="ts">
import HotbarSet from './HotbarSet.vue';

type Props = {
    focusLeft?: boolean;
    focusRight?: boolean;
};

const { focusLeft = false, focusRight = false } = defineProps<Props>();
</script>

<template>
    <div class="cross-hotbar flex flex-row items-center justify-end self-center">
        <div class="grow" />
        <HotbarSet :focused="focusLeft" :class="focusRight ? 'text-[.75em]' : ''" />
        <div class="h-16 border-l border-gray-700" />
        <HotbarSet :focused="focusRight" :class="focusLeft ? 'text-[.75em]' : ''" />
    </div>
</template>
