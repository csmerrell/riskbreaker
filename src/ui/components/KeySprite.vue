<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
    animatedGamepadSpriteMap,
    GAMEPAD_GRID_CONFIG,
    gamepadSpriteMap,
} from '../views/PauseMenu/ControlSpriteMap';
import { MappedCommand } from '@/game/input/InputMap';
import { useGamepad } from '@/game/input/useGamepads';
import { useKeyboard } from '@/game/input/useKeyboard';

export type SpriteMap = [number, number, { width?: number; height?: number }];

const props = withDefaults(
    defineProps<{
        command: MappedCommand;
        animated?: boolean;
        animationSpeed?: number;
        scale?: number;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    }>(),
    {
        scale: 1,
        animated: false,
        animationSpeed: 2000,
        size: 'md',
    },
);

const spriteScale = ref(3); // Overridden onMounted

const gamepadImageUrl = '/image/import/ControllerUI/UI_Gamepad.png';

const { inputType: inputTypeState } = useGameContext();
const inputType = ref(inputTypeState.value);
inputTypeState.subscribe((next) => {
    inputType.value = next;
});

const keyboardText = computed(() => {
    if (inputType.value !== 'keyboard') return null;
    const { getUnmappedKey } = useKeyboard();
    const unmappedKey = getUnmappedKey(props.command);
    return unmappedKey
        ? `[${unmappedKey.startsWith('Key') ? unmappedKey.substring(3) : unmappedKey}]: `
        : '';
});

const spriteMap = computed(() => {
    if (inputType.value === 'controller') {
        const { getUnmappedButton } = useGamepad();
        const unmappedKey = getUnmappedButton(props.command);
        // Use animated sprite map for animated sprites, static for static sprites
        const map = props.animated ? animatedGamepadSpriteMap : gamepadSpriteMap;
        return map[unmappedKey];
    }
    return null;
});

// Function to get the current sprite scale from CSS variable
const updateSpriteScale = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const scale = parseFloat(computedStyle.getPropertyValue('--keysprite-scale').trim()) || 3;
    spriteScale.value = scale * props.scale;
};

// Preload images and setup resize listener
onMounted(() => {
    // Get initial scale
    updateSpriteScale();

    // Listen for resize events
    window.addEventListener('resize', updateSpriteScale);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateSpriteScale);
});

const spriteStyles = computed(() => {
    if (!spriteMap.value || inputType.value !== 'controller') return {};

    const [x, y, options = {}] = spriteMap.value;

    const width = (options?.width || 1) * GAMEPAD_GRID_CONFIG.spriteWidth;
    const height = (options?.height || 1) * GAMEPAD_GRID_CONFIG.spriteHeight;

    return {
        width: `${width * spriteScale.value}px`,
        height: `${height * spriteScale.value}px`,
        backgroundImage: `url(${gamepadImageUrl})`,
        backgroundPosition: `-${x * GAMEPAD_GRID_CONFIG.spriteWidth * spriteScale.value}px -${y * GAMEPAD_GRID_CONFIG.spriteHeight * spriteScale.value + 3}px`,
        backgroundSize: `${GAMEPAD_GRID_CONFIG.columns * GAMEPAD_GRID_CONFIG.spriteWidth * spriteScale.value}px auto`, // Full sheet width scaled
        '--animation-duration': `${props.animationSpeed}ms`,
        '--base-x': `${x * GAMEPAD_GRID_CONFIG.spriteWidth * spriteScale.value}px`,
        '--frame-width': `${(options?.width || 1) * GAMEPAD_GRID_CONFIG.spriteWidth * spriteScale.value}px`, // Move by sprite width scaled
    };
});
</script>

<template>
    <span v-if="inputType === 'keyboard'" :class="`text-standard-${size}`">{{ keyboardText }}</span>
    <div v-else class="key-sprite" :class="{ animated: animated }" :style="spriteStyles" />
</template>

<style scoped>
.key-sprite {
    display: inline-block;
    image-rendering: pixelated;
    background-repeat: no-repeat;
}

.key-sprite.animated {
    animation: button-press-animation var(--animation-duration, 2000ms) infinite;
}

@keyframes button-press-animation {
    /* Frame 1: idle/normal state (0-50%) */
    0%,
    82.99% {
        background-position-x: calc(-1 * var(--base-x));
    }

    /* Frame 2: slight press (50-65%) */
    83%,
    88.99% {
        background-position-x: calc(-1 * var(--base-x) - var(--frame-width));
    }

    /* Frame 3: full press (65-85%) */
    89%,
    94.99% {
        background-position-x: calc(-1 * var(--base-x) - 2 * var(--frame-width));
    }

    /* Frame 4: release/return (85-100%) */
    95%,
    100% {
        background-position-x: calc(-1 * var(--base-x) - 3 * var(--frame-width));
    }
}
</style>
