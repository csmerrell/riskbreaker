<script setup lang="ts">
import { MappedCommand } from '@/game/input/InputMap.js';
import ControlIconSprite from './ControlIconSprite.vue';

type Props = {
    label: string;
    command: MappedCommand;
    focused?: boolean;
};

const { label, focused = false } = defineProps<Props>();
</script>

<template>
    <div v-if="focused" class="absolute">
        <div class="text-standard-md relative bottom-1 flex h-auto flex-row gap-2">
            <ControlIconSprite :command size="xs" class="invisible" />
            <div class="invisible">{{ label }}</div>
            <div class="absolute inset-0 z-20 flex flex-row items-start">
                <ControlIconSprite :command size="xs" />
                <div class="absolute bottom-1 right-0 z-20">{{ label }}</div>
            </div>
            <div class="double-fade-bg absolute inset-0 z-10 -mx-2 -mb-2" />
        </div>
    </div>
</template>

<style scoped>
.double-fade-bg {
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(var(--bg-dark-rgb), 0.9) 15%,
        rgba(var(--bg-dark-rgb), 0.9) 85%,
        transparent 100%
    );
}
</style>
