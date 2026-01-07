<!-- ExplorationCanvas.vue -->
<script setup lang="ts">
import { loadMapAsync, maps } from '@/resource/maps';
import { nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const el = ref<HTMLElement | null>(null);

const promises: Promise<unknown>[] = [];
Object.keys(maps).forEach((key: keyof typeof maps) => {
    promises.push(loadMapAsync(key));
});

const route = useRoute();
watch(
    () => route.path,
    async (path) => {
        await nextTick();

        const canvas = el.value;
        if (!canvas) return;

        const targetId = path.startsWith('/exploration')
            ? 'exploration-container'
            : 'exploration-ph';

        const target = document.getElementById(targetId);
        if (!target) return;

        if (canvas.parentElement !== target) {
            target.appendChild(canvas);
        }
    },
    { immediate: true },
);

const ready = ref(false);
Promise.all(promises).then(() => {
    ready.value = true;
});
</script>

<template>
    <canvas id="exploration-canvas" ref="el" />
</template>
