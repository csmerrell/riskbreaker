<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { ref } from 'vue';

type Props = {
    type: 'arrow' | 'underline';
    blink?: boolean;
    primary?: boolean;
    opacity?: number;
    scale?: number;
    width?: number;
};

type ArrowIndicatorProps = Props & {
    type: 'arrow';
    direction?: 'down' | 'up' | 'left' | 'right';
};

type UnderlineIndicatorProps = Props & {
    type: 'underline';
};

const props = defineProps<Props & (ArrowIndicatorProps | UnderlineIndicatorProps)>();
const { type, blink, primary = false, opacity = 1 } = props;

const rotation = ref<string>('');
if (type === 'arrow') {
    const { direction = 'down' } = props;
    switch (direction) {
        case 'up':
            rotation.value = 'rotate(90deg)';
            break;
        case 'right':
            rotation.value = 'rotate(180deg)';
            break;
        case 'left':
            rotation.value = '';
            break;
        case 'down':
        default:
            rotation.value = 'rotate(-90deg)';
    }
}
</script>

<template>
    <div
        class="-translate-x-1/2 -translate-y-1/2"
        :style="{
            height: `${~~(24 * getScale() + 1)}px`,
            width: `${~~(props.width ?? (24 * getScale()) / 1.5)}px`,
            ...(blink ? { '--max-opacity': Math.min(opacity, 1) } : {}),
        }"
        :class="blink && 'blink-animation'"
    >
        <img
            v-if="props.type === 'arrow'"
            src="/image/misc/ArrowIndicator.png"
            :style="{
                height: `${16 * (props.scale ?? 1)}px`,
                width: `${16 * (props.scale ?? 1)}px`,
                transform: rotation,
            }"
        />
        <div v-if="props.type === 'underline'" class="border-b-4 border-amber-300" />
    </div>
</template>

<style scoped>
@keyframes blink {
    0%,
    100% {
        filter: brightness(0.8);
    }
    50% {
        filter: brightness(1.2);
    }
}

.blink-animation {
    animation: blink 1.25s ease-in-out infinite;
}
</style>
