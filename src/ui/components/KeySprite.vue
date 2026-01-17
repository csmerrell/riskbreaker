<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
    animatedGamepadSpriteMap,
    animatedKeySpriteMap,
    GAMEPAD_GRID_CONFIG,
    gamepadSpriteMap,
    KEYBOARD_ANIMATED_GRID_CONFIG,
    KEYBOARD_STATIC_GRID_CONFIG,
    keySpriteMap,
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
    }>(),
    {
        scale: 1,
        animated: false,
        animationSpeed: 2000,
    },
);

const spriteScale = ref(3); // Overridden onMounted

const gamepadImageUrl = '/image/import/ControllerUI/UI_Gamepad.png';
const keyboardStaticImageUrl = '/image/import/KeyboardUI/Keyboard_UI.png';
const keyboardAnimatedImageUrl = '/image/import/KeyboardUI/Keyboard_UI_Black_Animated.png';

const { inputType: inputTypeState } = useGameContext();
const inputType = ref(inputTypeState.value);
inputTypeState.subscribe((next) => {
    inputType.value = next;
});

const imageUrl = computed(() => {
    return inputType.value === 'controller'
        ? gamepadImageUrl
        : props.animated
          ? keyboardAnimatedImageUrl
          : keyboardStaticImageUrl;
});

const gridConfig = computed(() => {
    return inputType.value === 'controller'
        ? GAMEPAD_GRID_CONFIG
        : props.animated
          ? KEYBOARD_ANIMATED_GRID_CONFIG
          : KEYBOARD_STATIC_GRID_CONFIG;
});

const spriteMap = computed(() => {
    if (inputType.value === 'controller') {
        const { getUnmappedButton } = useGamepad();
        const unmappedKey = getUnmappedButton(props.command);
        // Use animated sprite map for animated sprites, static for static sprites
        const map = props.animated ? animatedGamepadSpriteMap : gamepadSpriteMap;
        return map[unmappedKey];
    } else {
        const { getUnmappedKey } = useKeyboard();
        const unmappedKey = getUnmappedKey(props.command);
        // Use animated sprite map for animated sprites, static for static sprites
        const map = props.animated ? animatedKeySpriteMap : keySpriteMap;
        return map[unmappedKey];
    }
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
    if (!spriteMap.value) return {};

    const [x, y, options = {}] = spriteMap.value;

    const width = (options?.width || 1) * gridConfig.value.spriteWidth;
    const height = (options?.height || 1) * gridConfig.value.spriteHeight;

    return {
        width: `${width * spriteScale.value}px`,
        height: `${height * spriteScale.value}px`,
        backgroundImage: `url(${imageUrl.value})`,
        backgroundPosition: `-${x * gridConfig.value.spriteWidth * spriteScale.value}px -${y * gridConfig.value.spriteHeight * spriteScale.value + 3}px`,
        backgroundSize: `${gridConfig.value.columns * gridConfig.value.spriteWidth * spriteScale.value}px auto`, // Full sheet width scaled
        '--animation-duration': `${props.animationSpeed}ms`,
        '--base-x': `${x * gridConfig.value.spriteWidth * spriteScale.value}px`,
        '--frame-width': `${(options?.width || 1) * gridConfig.value.spriteWidth * spriteScale.value}px`, // Move by sprite width scaled
    };
});
</script>

<template>
    <div class="key-sprite" :class="{ animated: animated }" :style="spriteStyles" />
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
