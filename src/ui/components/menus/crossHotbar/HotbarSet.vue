<script setup lang="ts">
import HotbarQuad, { type QuadEvents } from './HotbarQuad.vue';
import { computed, onUnmounted, ref } from 'vue';
import { getScale } from '@/lib/helpers/screen.helper';
import {
    captureControls,
    registerHoldListener,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { InputMap } from '@/game/input/InputMap.js';

export type HotbarKey =
    | 'hotbarDUp'
    | 'hotbarDLeft'
    | 'hotbarDRight'
    | 'hotbarDDown'
    | 'hotbarFUp'
    | 'hotbarFLeft'
    | 'hotbarFRight'
    | 'hotbarFDown';

type QuadType = 'dpad' | 'faceButton';
export type IconType = 'skill' | 'menu';

type Props = {
    iconType: IconType;
    actions: {
        dPad?: QuadEvents;
        faceButton?: QuadEvents;
    };
    scaleDirection?: 'left' | 'right';
    gateButton: 'shoulder_left' | 'shoulder_right';
    quads?: QuadType[];
    capturesControls?: boolean;
};

const {
    iconType,
    actions,
    scaleDirection = 'right',
    gateButton,
    quads = ['dpad', 'faceButton'],
    capturesControls = false,
} = defineProps<Props>();

const focused = ref(false);
const listeners: string[] = [];

// Register gate button listener
function onHold(inputs?: InputMap) {
    focused.value = inputs?.[gateButton] ?? false;
    if (!focused.value && capturesControls) {
        unCaptureControls();
    }
}
if (capturesControls) {
    listeners.push(
        registerInputListener(() => {
            captureControls('hotbarSet');
            registerHoldListener((inputs) => onHold(inputs));
        }, gateButton),
    );
} else {
    registerHoldListener((inputs) => onHold(inputs));
}

onUnmounted(() => {
    listeners.forEach((l) => unregisterInputListener(l));
});

// Extract events from unit abilities
const dpadEvents = computed(() => actions.dPad ?? {});

const faceEvents = computed(() => actions.faceButton ?? {});

const focusScale = ref(1 + 1 / getScale());
const focusTranslate = ref(1 / getScale() / 2);

const showDpad = computed(() => quads.includes('dpad'));
const showFace = computed(() => quads.includes('faceButton'));
</script>

<template>
    <div
        class="hotbar-set flex flex-row items-center gap-1"
        :class="!focused ? 'text-[.75em]' : ''"
        :style="{
            ...(focused && {
                transform: `scale(${focusScale}) translate(${focusTranslate * (scaleDirection === 'left' ? -100 : 100)}%, -${focusTranslate * 100}%)`,
            }),
        }"
    >
        <HotbarQuad
            v-if="showDpad"
            :events="dpadEvents"
            command-set="hotbarD"
            :focused="focused"
            :icon-type
        />
        <div v-if="showDpad && showFace" class="mx-1" />
        <HotbarQuad
            v-if="showFace"
            :events="faceEvents"
            command-set="hotbarF"
            :focused="focused"
            :icon-type
        />
    </div>
</template>

<style>
.hotbar-set {
    transition: transform 0.1s ease-in;
}
</style>
