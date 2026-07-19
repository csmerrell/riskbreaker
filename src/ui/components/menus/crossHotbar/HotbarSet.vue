<script setup lang="ts">
import HotbarQuad, { type QuadEvents } from './HotbarQuad.vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
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
    scaleAnchor?: 'left' | 'right';
    gateButton?: 'shoulder_left' | 'shoulder_right';
    quads?: QuadType[];
    capturesControls?: boolean;
};

const {
    iconType,
    actions,
    scaleAnchor = 'left',
    gateButton,
    quads = ['dpad', 'faceButton'],
    capturesControls = false,
} = defineProps<Props>();

const focused = ref(false);
const listeners: string[] = [];

// Register gate button listener
function onHold(inputs?: InputMap) {
    focused.value = inputs?.[gateButton!] ?? false;
    if (!focused.value && capturesControls) {
        unCaptureControls();
    }
}
const container = ref<HTMLDivElement>();
const emit = defineEmits(['transition-end']);
function transitionEnd() {
    emit('transition-end');
    container.value?.removeEventListener('transitionend', transitionEnd);
}
watch(focused, () => {
    container.value?.addEventListener('transitionend', transitionEnd);
});

watch(
    () => gateButton,
    () => {
        if (gateButton) {
            registerGates();
        }
    },
);

function registerGates() {
    if (capturesControls && gateButton) {
        listeners.push(
            registerInputListener(() => {
                captureControls('hotbarSet');
                registerHoldListener((inputs) => onHold(inputs));
            }, gateButton),
        );
    } else if (gateButton) {
        registerHoldListener((inputs) => onHold(inputs));
    }
}
onMounted(() => registerGates);

onUnmounted(() => {
    listeners.forEach((l) => unregisterInputListener(l));
});

// Extract events from unit abilities
const dpadEvents = computed(() => actions.dPad ?? {});

const faceEvents = computed(() => actions.faceButton ?? {});

const focusScale = ref(1 + 1 / getScale());

const showDpad = computed(() => quads.includes('dpad'));
const showFace = computed(() => quads.includes('faceButton'));
</script>

<template>
    <div
        ref="container"
        class="hotbar-set flex flex-row items-center gap-1"
        :class="!focused ? 'text-[.75em]' : ''"
        :style="{
            transformOrigin: `center ${scaleAnchor}`,
            ...(focused && {
                transform: `scale(${focusScale})`,
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
