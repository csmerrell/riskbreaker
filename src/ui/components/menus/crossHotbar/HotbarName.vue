<script setup lang="ts"></script>

<template>
    <div
        class="hotbar-name absolute left-1/2 z-10 -translate-x-1/2 text-nowrap pb-1 text-sm text-white"
        :style="{ top: 'calc(100% + 2px)' }"
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
