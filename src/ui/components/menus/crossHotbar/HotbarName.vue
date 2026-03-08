<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { ref } from 'vue';

const width = ref((getScale() - 2) * 24);
</script>

<template>
    <div
        class="hotbar-name absolute z-10 pb-1 text-center text-sm text-white"
        :style="{ top: 'calc(100% + 2px)', width: `${width}px` }"
    >
        <slot />
    </div>
</template>

<style scoped>
.hotbar-name {
    background: radial-gradient(
        ellipse 50% 100% at center,
        rgba(21, 29, 40, 0.8) 0%,
        rgba(21, 29, 40, 0.6) 75%,
        rgba(21, 29, 40, 0) 100%
    );
}
</style>
