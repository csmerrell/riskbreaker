<script setup lang="ts">
import HotbarQuad from './HotbarQuad.vue';
import { computed, onUnmounted, ref } from 'vue';
import { PartyMember } from '@/state/useParty';
import { getScale } from '@/lib/helpers/screen.helper';
import {
    captureControls,
    registerHoldListener,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';

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

type Props = {
    unit: PartyMember;
    side: 'left' | 'right';
    gateButton: 'shoulder_left' | 'shoulder_right';
    quads?: QuadType[];
};

const { unit, side, gateButton, quads = ['dpad', 'faceButton'] } = defineProps<Props>();

const focused = ref(false);
const listeners: string[] = [];

// Register gate button listener
listeners.push(
    registerInputListener(() => {
        captureControls('hotbarSet');
        registerHoldListener((inputs) => {
            focused.value = inputs?.[gateButton] ?? false;
            if (!focused.value) {
                unCaptureControls();
            }
        });
    }, gateButton),
);

onUnmounted(() => {
    listeners.forEach((l) => unregisterInputListener(l));
});

// Extract events from unit abilities
const dpadEvents = computed(() => ({
    up: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarDUp`)?.action,
    down: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarDDown`)?.action,
    left: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarDLeft`)?.action,
    right: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarDRight`)?.action,
}));

const faceEvents = computed(() => ({
    up: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarFUp`)?.action,
    down: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarFDown`)?.action,
    left: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarFLeft`)?.action,
    right: Object.values(unit.abilities).find((v) => v.hotkey === `${side}.hotbarFRight`)?.action,
}));

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
                transform: `scale(${focusScale}) translate(${focusTranslate * (side === 'left' ? -100 : 100)}%, -${focusTranslate * 100}%)`,
            }),
        }"
    >
        <HotbarQuad v-if="showDpad" :events="dpadEvents" command-set="hotbarD" :focused="focused" />
        <div v-if="showDpad && showFace" class="mx-1" />
        <HotbarQuad v-if="showFace" :events="faceEvents" command-set="hotbarF" :focused="focused" />
    </div>
</template>

<style>
.hotbar-set {
    transition: transform 0.1s ease-in;
}
</style>
