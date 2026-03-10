<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import {
    gamepadSpriteMap,
    gamepadSpriteSheet,
    GAMEPAD_GRID_CONFIG,
} from '../views/PauseMenu/ControlSpriteMap';
import { MappedCommand } from '@/game/input/InputMap';
import { useGamepad } from '@/game/input/useGamepads';
import { useKeyboard } from '@/game/input/useKeyboard';
import { getScale } from '@/lib/helpers/screen.helper';

const props = withDefaults(
    defineProps<{
        command: MappedCommand;
        forceGamepad?: boolean;
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    }>(),
    {
        forceGamepad: false,
        size: 'md',
    },
);

const imgContainer = ref<HTMLDivElement>();
const { inputType: inputTypeState } = useGameContext();
const inputType = ref(inputTypeState.value);

inputTypeState.subscribe((next) => {
    inputType.value = next!;
});

const keyboardText = computed(() => {
    if (inputType.value !== 'keyboard') return null;
    const { getUnmappedKey } = useKeyboard();
    const unmappedKey = getUnmappedKey(props.command);
    return unmappedKey
        ? `[${unmappedKey.startsWith('Key') ? unmappedKey.substring(3) : unmappedKey}]`
        : '';
});

const scaleFactor = computed(() => {
    const baseScale = getScale();
    switch (props.size) {
        case 'xs':
            return Math.max(baseScale - 2, 1);
        case 'sm':
            return Math.max(baseScale - 1, 1);
        case 'md':
            return baseScale;
        case 'lg':
            return baseScale + 1;
        case 'xl':
            return baseScale + 2;
        default:
            return baseScale;
    }
});

const spriteSize = computed(() => {
    return GAMEPAD_GRID_CONFIG.spriteWidth * scaleFactor.value;
});

const renderSprite = async () => {
    await nextTick();
    if (!imgContainer.value) return;

    // Clear previous content
    imgContainer.value.innerHTML = '';

    if (inputType.value === 'controller' || props.forceGamepad) {
        const { getUnmappedButton } = useGamepad();
        const unmappedButton = getUnmappedButton(props.command);

        if (unmappedButton && gamepadSpriteMap[unmappedButton]) {
            const [col, row, options = {}] = gamepadSpriteMap[unmappedButton];
            const width = (options.width || 1) * GAMEPAD_GRID_CONFIG.spriteWidth;
            const height = (options.height || 1) * GAMEPAD_GRID_CONFIG.spriteHeight;

            try {
                const imageEl = await gamepadSpriteSheet().getSpriteAsImage(col, row);
                imageEl.style.setProperty('width', `${width * scaleFactor.value}px`);
                imageEl.style.setProperty('height', `${height * scaleFactor.value}px`);
                imageEl.style.setProperty('image-rendering', 'pixelated');
                imgContainer.value.appendChild(imageEl);
            } catch (error) {
                console.error('Failed to render gamepad sprite:', error);
            }
        }
    }
};

const updateSprite = () => {
    renderSprite();
};

onMounted(() => {
    renderSprite();
    window.addEventListener('resize', updateSprite);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateSprite);
});

// Re-render when input type or command changes
const shouldRender = computed(() => ({
    inputType: inputType.value,
    command: props.command,
    forceGamepad: props.forceGamepad,
}));

// Watch for changes
import { watch } from 'vue';
watch(shouldRender, () => {
    renderSprite();
});
</script>

<template>
    <span v-if="!forceGamepad && inputType === 'keyboard'" class="keyboard-text">{{
        keyboardText
    }}</span>
    <div
        v-else
        ref="imgContainer"
        class="control-icon-sprite -mt-2"
        :style="{
            width: `${spriteSize}px`,
            height: `${spriteSize}px`,
        }"
    />
</template>

<style scoped>
.control-icon-sprite {
    display: inline-block;
    line-height: 0;
}

.keyboard-text {
    display: inline-block;
    font-family: monospace;
}
</style>
