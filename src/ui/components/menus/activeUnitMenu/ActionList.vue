<script setup lang="ts">
type Props = {
    selectedAction: number;
    actions: { name: string; onSelect: () => Promise<void> }[];
};

const { actions } = defineProps<Props>();
</script>

<template>
    <div class="text-standard-md flex flex-col items-end overflow-hidden text-white">
        <div
            v-for="(action, idx) in actions"
            :key="action.name"
            :class="selectedAction === idx && 'bg-rose-500'"
            class="px-4 py-1"
        >
            {{ action.name }}
        </div>
    </div>
</template>
