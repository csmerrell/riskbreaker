<script setup lang="ts">
import { MappedCommand } from '@/game/input/InputMap';
import KeySprite from '../../KeySprite.vue';

type Props = {
    label: string;
    command: MappedCommand;
};

const { label, command } = defineProps<Props>();
</script>

<template>
    <div class="skew-x-6 bg-amber-400">
        <div class="text-standard-lg relative -skew-x-6 py-px pl-2 pr-8">
            <KeySprite :command force-gamepad size="sm" class="absolute -right-1 -top-3 size-0" />
            <div>{{ label }}</div>
        </div>
    </div>
</template>
