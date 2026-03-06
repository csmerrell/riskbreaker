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
    <div
        class="item-gradient skew-x-12 border-2 border-yellow-700 bg-yellow-500 shadow-md shadow-bg"
    >
        <div class="text-standard-lg relative top-1 -skew-x-12 py-px pl-2 pr-10">
            <KeySprite :command force-gamepad size="sm" class="absolute -right-2 -top-4 size-0" />
            <div>{{ label }}</div>
        </div>
    </div>
</template>
