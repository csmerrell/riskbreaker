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
    isCurrentMenuItem: () => boolean;
    onSelect: (e: string) => void;
};

const { options, onSelect } = defineProps<Props>();
const currentValue = ref(options[0]);
const focused = ref(false);
const cursorPos = ref(options.findIndex((o) => o.key === currentValue.value.key));

defineExpose({
    getValue: () => {
        return currentValue.value;
    },
    focus: () => {
        focused.value = true;
        captureControls();
        registerInputListeners();
    },
});

const emit = defineEmits(['directionalExit']);

let menuRight: string;
let menuLeft: string;
let confirm: string;
let cancel: string;
let upExit: string;
let downExit: string;
function registerInputListeners() {
    menuRight = registerInputListener(() => {
        cursorPos.value = Math.min(options.length - 1, cursorPos.value + 1);
    }, ['movement_right', 'menu_right']);

    menuLeft = registerInputListener(() => {
        if (cursorPos.value === 0) {
            onBlur();
        } else {
            cursorPos.value = cursorPos.value - 1;
        }
    }, ['movement_left', 'menu_left']);

    confirm = registerInputListener(() => {
        onSelect(options[cursorPos.value].key);
        onBlur();
    }, 'confirm');

    cancel = registerInputListener(() => {
        onBlur();
    }, 'cancel');

    upExit = registerInputListener(() => {
        onBlur();
        emit('directionalExit', 'menu_up');
    }, ['movement_up', 'menu_up']);

    downExit = registerInputListener(() => {
        onBlur();
        emit('directionalExit', 'menu_down');
    }, ['movement_down', 'menu_down']);
}

function onBlur() {
    focused.value = false;
    cursorPos.value = options.findIndex((o) => o.key === currentValue.value.key);
    unregisterInputListener(menuRight);
    unregisterInputListener(menuLeft);
    unregisterInputListener(confirm);
    unregisterInputListener(cancel);
    unregisterInputListener(upExit);
    unregisterInputListener(downExit);
    unCaptureControls();
}
</script>

<template>
    <div class="flex flex-row items-center justify-start gap-4">
        <div
            v-for="(option, idx) in options"
            :key="option.key"
            :class="
                focused && cursorPos === idx
                    ? 'text-rose-700'
                    : currentValue.key === option.key
                      ? 'text-white'
                      : 'text-gray-500'
            "
        >
            <span
                class="picon-chevron-right"
                :class="(!focused || cursorPos !== idx) && 'invisible'"
            />
            {{ option.label }}
        </div>
    </div>
</template>
