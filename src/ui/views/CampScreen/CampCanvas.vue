<script setup lang="ts">
import { resources } from '@/resource';
import { nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const el = ref<HTMLElement | null>(null);

const promises: Promise<unknown>[] = [];
[
    ...Object.values(resources.image.misc),
    resources.image.units.LifebinderLean,
    resources.image.units.NaturalistSit,
].forEach((img) => {
    if (!img.isLoaded()) {
        promises.push(img.load());
    }
});

const route = useRoute();
watch(
    () => route.path,
    async (path) => {
        await nextTick();

        const canvas = el.value;
        if (!canvas) return;

        const targetId = path.startsWith('/exploration') ? 'camp-container' : 'camp-ph';

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
    <canvas id="camp-canvas" ref="el" class="size-full" />
</template>
