<template>
    <div class="key-sprite" :class="{ animated: animated && imageLoaded }" :style="spriteStyles" />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

export type SpriteMap = [number, number, { width?: number; height?: number }];

const props = withDefaults(
    defineProps<{
        spriteMap: SpriteMap;
        animated?: boolean;
        animationSpeed?: number;
    }>(),
    {
        animated: false,
        animationSpeed: 2000,
    },
);

const imageLoaded = ref(false);
const spriteScale = ref(2); // Default scale

const staticImageUrl = '/image/import/KeyboardUI/Keyboard_UI.png';
const animatedImageUrl = '/image/import/KeyboardUI/Keyboard_UI_Black_Animated.png';

// Function to get the current sprite scale from CSS variable
const updateSpriteScale = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const scale = parseFloat(computedStyle.getPropertyValue('--sprite-scale').trim()) || 2;
    spriteScale.value = scale;
};

// Preload images and setup resize listener
onMounted(() => {
    const img = new Image();
    img.onload = () => {
        imageLoaded.value = true;
    };
    img.src = props.animated ? animatedImageUrl : staticImageUrl;

    // Get initial scale
    updateSpriteScale();

    // Listen for resize events
    window.addEventListener('resize', updateSpriteScale);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateSpriteScale);
});

// Grid configuration for static sprites
const STATIC_GRID_CONFIG = {
    columns: 23,
    rows: 15,
    spriteWidth: 16,
    spriteHeight: 16,
};

// Grid configuration for animated sprites (4 frames vertically per sprite)
const ANIMATED_GRID_CONFIG = {
    columns: 23, // Same columns as static
    rows: 60, // More rows to accommodate 4 frames per sprite (15 * 4 = 60, but could be more)
    spriteWidth: 16,
    spriteHeight: 16,
    animationFrames: 4,
};

// Preload images
onMounted(() => {
    const img = new Image();
    img.onload = () => {
        imageLoaded.value = true;
    };
    img.src = props.animated ? animatedImageUrl : staticImageUrl;
});

const spriteStyles = computed(() => {
    if (!props.spriteMap) return {};

    const [x, y, options = {}] = props.spriteMap;

    if (props.animated && imageLoaded.value) {
        // Use animated grid configuration
        const width = (options?.width || 1) * ANIMATED_GRID_CONFIG.spriteWidth;
        const height = (options?.height || 1) * ANIMATED_GRID_CONFIG.spriteHeight;
        const totalSheetWidth = ANIMATED_GRID_CONFIG.columns * ANIMATED_GRID_CONFIG.spriteWidth;
        const scaledSheetWidth = totalSheetWidth / 4; // Should be 368px

        console.log('animated sprite should be [', width, '] pixels wide');
        console.log(
            'base position x:',
            x,
            'y:',
            y,
            'calculated px:',
            x * ANIMATED_GRID_CONFIG.spriteWidth,
            y * ANIMATED_GRID_CONFIG.spriteHeight,
        );
        console.log('frame width:', width, 'spriteWidth:', ANIMATED_GRID_CONFIG.spriteWidth);
        console.log('total sheet width:', totalSheetWidth, 'scaled:', scaledSheetWidth);

        return {
            width: `${width * spriteScale.value}px`,
            height: `${height * spriteScale.value}px`,
            backgroundImage: `url(${animatedImageUrl})`,
            backgroundPosition: `-${x * ANIMATED_GRID_CONFIG.spriteWidth * spriteScale.value}px -${y * ANIMATED_GRID_CONFIG.spriteHeight * spriteScale.value + 3}px`,
            backgroundSize: `${ANIMATED_GRID_CONFIG.columns * ANIMATED_GRID_CONFIG.spriteWidth * spriteScale.value}px auto`, // Full sheet width scaled
            '--animation-duration': `${props.animationSpeed}ms`,
            '--base-x': `${x * ANIMATED_GRID_CONFIG.spriteWidth * spriteScale.value}px`,
            '--frame-width': `${(options?.width || 1) * ANIMATED_GRID_CONFIG.spriteWidth * spriteScale.value - 3}px`, // Move by sprite width scaled
        };
    } else {
        // Use static grid configuration
        const width = (options?.width || 1) * STATIC_GRID_CONFIG.spriteWidth;
        const height = (options?.height || 1) * STATIC_GRID_CONFIG.spriteHeight;
        const staticSheetWidth = STATIC_GRID_CONFIG.columns * STATIC_GRID_CONFIG.spriteWidth;

        return {
            width: `${width * spriteScale.value}px`,
            height: `${height * spriteScale.value}px`,
            backgroundImage: `url(${staticImageUrl})`,
            backgroundPosition: `-${x * STATIC_GRID_CONFIG.spriteWidth * spriteScale.value}px -${y * STATIC_GRID_CONFIG.spriteHeight * spriteScale.value}px`,
            backgroundSize: `${staticSheetWidth * spriteScale.value}px auto`,
        };
    }
});
</script>

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
    74.99% {
        background-position-x: calc(-1 * var(--base-x));
    }

    /* Frame 2: slight press (50-65%) */
    75%,
    82.99% {
        background-position-x: calc(-1 * var(--base-x) - var(--frame-width));
    }

    /* Frame 3: full press (65-85%) */
    83%,
    91.99% {
        background-position-x: calc(-1 * var(--base-x) - 2 * var(--frame-width));
    }

    /* Frame 4: release/return (85-100%) */
    92%,
    100% {
        background-position-x: calc(-1 * var(--base-x) - 3 * var(--frame-width));
    }
}
</style>
