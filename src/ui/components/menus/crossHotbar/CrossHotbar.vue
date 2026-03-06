<script setup lang="ts">
import { ref } from 'vue';
import HotbarSet from './HotbarSet.vue';
import { resources } from '@/resource';

type Props = {
    focusLeft?: boolean;
    focusRight?: boolean;
};

const { focusLeft = false, focusRight = false } = defineProps<Props>();

const ready = ref(false);
if (resources.image.icons.skills.isLoaded()) {
    ready.value = true;
} else {
    resources.image.icons.skills.load().then(() => {
        ready.value = true;
    });
}
</script>

<template>
    <div
        v-if="ready"
        class="cross-hotbar flex -translate-x-1/2 -translate-y-full flex-row items-center justify-end gap-4 self-center rounded-lg p-4"
    >
        <HotbarSet side="left" :focused="focusLeft" :class="focusRight ? 'text-[.75em]' : ''" />
        <div class="h-16 border-l border-yellow-500" />
        <HotbarSet side="right" :focused="focusRight" :class="focusLeft ? 'text-[.75em]' : ''" />
    </div>
</template>

<style scoped>
.cross-hotbar {
    background: radial-gradient(
        ellipse 55% 50% at center,
        rgba(21, 29, 40, 0.5) 0%,
        rgba(21, 29, 40, 0.5) 80%,
        rgba(21, 29, 40, 0) 100%
    );
}
</style>
