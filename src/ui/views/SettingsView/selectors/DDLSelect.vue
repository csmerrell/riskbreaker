<script setup lang="ts" generic="T extends { key: string; label: string }">
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { ref } from 'vue';

type Props = {
    options: T[];
    onSelect: (e: string) => void;
    isCurrentMenuItem: () => boolean;
};
const { options, onSelect } = defineProps<Props>();

const currentValue = ref<T | null>(options[0]);
const cursorPos = ref(options.findIndex((o) => o.key === currentValue.value.key));

const open = ref(false);

defineExpose({
    getValue: (): T | null => {
        return currentValue.value;
    },
    focus: () => {
        open.value = true;
        captureControls();
        registerInputListeners();
    },
});

let menuDown: string;
let menuUp: string;
let confirm: string;
let cancel: string;
let leftExit: string;
function registerInputListeners() {
    menuDown = registerInputListener(() => {
        cursorPos.value = Math.min(options.length - 1, cursorPos.value + 1);
    }, ['movement_down', 'menu_down']);

    menuUp = registerInputListener(() => {
        cursorPos.value = Math.max(0, cursorPos.value - 1);
    }, ['movement_up', 'menu_up']);

    confirm = registerInputListener(() => {
        currentValue.value = options[cursorPos.value];
        onSelect(options[cursorPos.value].key);
        open.value = false;
        onBlur();
    }, 'confirm');

    cancel = registerInputListener(() => {
        open.value = false;
        cursorPos.value = options.findIndex((o) => o.key === currentValue.value.key);
        onBlur();
    }, ['cancel', 'movement_left', 'menu_left']);
}

function onBlur() {
    unregisterInputListener(menuDown);
    unregisterInputListener(menuUp);
    unregisterInputListener(confirm);
    unregisterInputListener(cancel);
    unregisterInputListener(leftExit);
    unCaptureControls();
}
</script>

<template>
    <div class="relative">
        <div
            :class="[
                'flex flex-row items-center justify-between gap-2',
                'border border-slate-950 bg-slate-900 px-4 shadow-md shadow-slate-950',
                open && 'invisible',
            ]"
        >
            <span>
                {{ currentValue.label }}
            </span>
            <span class="picon-chevron-down" />
        </div>
        <div
            :class="[
                'absolute left-0 top-0 flex flex-col gap-2',
                'border border-slate-950 bg-slate-900 px-4 shadow-lg shadow-slate-950',
                !open && 'invisible',
            ]"
        >
            <div
                v-for="(option, idx) in options"
                :key="option.key"
                :class="[
                    'flex flex-row items-center gap-2',
                    'whitespace-nowrap',
                    idx === cursorPos && 'text-rose-700',
                ]"
            >
                <div class="picon-chevron-right" :class="cursorPos !== idx && 'invisible'"></div>
                {{ option.label }}
            </div>
        </div>
    </div>
</template>
