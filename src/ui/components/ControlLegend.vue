<script setup lang="ts">
import KeySprite from './KeySprite.vue';
import type { MappedCommand } from '@/game/input/InputMap';
import { ref } from 'vue';
import { useGameContext } from '@/state/useGameContext';

interface ControlCommand {
    key: MappedCommand;
    label: string;
    animated?: boolean;
}

const {
    commands,
    scale = 1,
    animationSpeed,
    animateAll = false,
} = defineProps<{
    commands: ControlCommand[];
    scale?: number;
    animationSpeed?: number;
    animateAll?: boolean;
}>();

const { inputType: inputTypeState } = useGameContext();
const inputType = ref(inputTypeState.value);
inputTypeState.subscribe((next) => {
    inputType.value = next;
});
</script>

<template>
    <div class="text-standard-md flex flex-row flex-nowrap items-center gap-8 p-2">
        <div
            v-for="(command, index) in commands"
            :key="`${command.key}-${index}`"
            class="flex items-center gap-1 p-1"
        >
            <span class="whitespace-nowrap text-white"> {{ command.label }}: </span>
            <KeySprite
                :command="command.key"
                :animated="command.animated ?? animateAll"
                :animation-speed="animationSpeed"
                :scale="scale"
                class="shrink-0"
            />
        </div>
    </div>
</template>
