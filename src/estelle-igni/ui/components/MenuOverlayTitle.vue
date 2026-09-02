<script setup lang="ts">
type Props = {
    label: string;
    focused?: boolean;
};

const { label, focused = false } = defineProps<Props>();
</script>

<template>
    <div
        class="absolute z-20 leading-[1px] text-white"
        :class="focused ? 'text-standard-xl translate-y-1' : 'text-standard-lg translate-y-0.5'"
    >
        <div class="relative size-full">
            <div
                class="double-fade-bg absolute inset-x-0 top-1/2 z-10 -mx-4 h-5 -translate-y-1/2"
            />
            <div class="invisible">
                {{ label }}
            </div>
            <div class="absolute left-0 top-0 z-20">{{ label }}</div>
        </div>
    </div>
</template>

<style scoped>
.double-fade-bg {
    background: linear-gradient(
        90deg,
        transparent 0%,
        var(--bg-dark) 10%,
        var(--bg-dark) 90%,
        transparent 100%
    );
}
</style>
