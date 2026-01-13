<script setup lang="ts">
type Props = {
    selected: boolean;
    icon?: string;
    text: string;
};

const { selected, icon, text } = defineProps<Props>();
</script>

<template>
    <div class="relative" :class="selected ? 'text-white' : 'text-gray-500'">
        <span v-if="icon" :class="icon" />
        <slot v-else />
        <div
            v-if="selected"
            class="text-standard-sm absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap text-white"
        >
            {{ text }}
        </div>
    </div>
</template>
