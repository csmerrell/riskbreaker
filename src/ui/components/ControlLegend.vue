<script setup lang="ts">
import KeySprite from './KeySprite.vue';
import { keySpriteMap, animatedKeySpriteMap } from '@/ui/views/PauseMenu/ControlSpriteMap';
import { useKeyboard } from '@/game/input/useKeyboard';
import type { MappedCommand } from '@/game/input/InputMap';

interface ControlCommand {
    key: MappedCommand;
    label: string;
}

const props = withDefaults(
    defineProps<{
        commands: ControlCommand[];
        scale?: number;
        animationSpeed?: number;
        globalAnimated?: boolean;
    }>(),
    {
        animationSpeed: 400,
        globalAnimated: false,
        scale: 1,
    },
);

const { getUnmappedKey } = useKeyboard();

const getSpriteMapForCommand = (command: ControlCommand, isAnimated: boolean = false) => {
    const unmappedKey = getUnmappedKey(command.key);
    // Use animated sprite map for animated sprites, static for static sprites
    const spriteMap = isAnimated ? animatedKeySpriteMap : keySpriteMap;
    return spriteMap[unmappedKey];
};
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
                :sprite-map="getSpriteMapForCommand(command, props.globalAnimated)"
                :animated="props.globalAnimated"
                :animation-speed="props.animationSpeed"
                :scale="scale"
                class="shrink-0"
            />
        </div>
    </div>
</template>
