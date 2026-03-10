<script setup lang="ts">
import { MappedCommand } from '@/game/input/InputMap';
import ControlIconSprite from '../../ControlIconSprite.vue';

type Props = {
    label: string;
    command: MappedCommand;
    active: boolean;
};

const { label, command, active } = defineProps<Props>();
</script>

<template>
    <div
        class="skew-x-12 border-2 border-yellow-700 bg-yellow-500 shadow-md shadow-bg"
        :class="active && 'animate-active'"
    >
        <div class="text-standard-lg relative top-1 -skew-x-12 py-px pl-2 pr-10">
            <ControlIconSprite
                :command
                force-gamepad
                size="sm"
                class="text-standard-sm absolute -right-2 -top-2 size-0 text-white"
            />
            <div>{{ label }}</div>
        </div>
    </div>
</template>

<style scoped>
.animate-active {
    --scale-up: 1.1;
    --scale-down: 0.98;
    position: relative;
    animation:
        background-fade 0.125s ease-in-out forwards,
        button-depress 0.125s ease-out forwards;
}

.animate-active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, #f4d03f 50%, transparent 100%);
    animation: gradient-sweep-animation 0.125s ease-in-out forwards;
    pointer-events: none;
}

@keyframes background-fade {
    0%,
    50% {
        background: #d2bf55;
    }
    100% {
        background: #b39b1a;
    }
}

@keyframes gradient-sweep-animation {
    0% {
        width: 0;
        background: linear-gradient(
            90deg,
            transparent 0%,
            #f4d03f 25%,
            #f4d03f 75%,
            transparent 100%
        );
    }
    25% {
        width: 25%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            #f4d03f 25%,
            #f4d03f 75%,
            transparent 100%
        );
    }
    50% {
        width: 50%;
        background: linear-gradient(90deg, #b39b1a 0%, #f4d03f 66%, transparent 100%);
    }
    66% {
        width: 70%;
        background: linear-gradient(90deg, #b39b1a 0%, #f4d03f 75%, transparent 100%);
    }
    75% {
        width: 90%;
        background: linear-gradient(90deg, #b39b1a 0%, #f4d03f 90%, transparent 100%);
    }
    100% {
        left: 0;
        width: 100%;
        background: linear-gradient(90deg, #b39b1a 0%, transparent 100%);
    }
}

@keyframes button-depress {
    0% {
        @apply skew-x-12 scale-100;
    }
    25% {
        @apply skew-x-12 scale-[var(--scale-up)];
    }
    50% {
        @apply skew-x-12 scale-100;
    }
    75% {
        @apply skew-x-12 scale-[var(--scale-down)];
    }
    100% {
        @apply skew-x-12 scale-[var(--scale-down)];
    }
}
</style>
