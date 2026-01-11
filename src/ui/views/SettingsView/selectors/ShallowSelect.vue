<script setup lang="ts" generic="T extends { key: string; label: string }">
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';
import { SettingsKey, useSettings } from '@/state/useSettings';
import { ref } from 'vue';

type Props = {
    settingKey: SettingsKey;
    options: T[];
    getSelected: () => T;
    onSelect: (e: string) => void;
};

const { settingKey, options, getSelected, onSelect } = defineProps<Props>();
const currentValue = ref(getSelected());
const focused = ref(false);
const cursorPos = ref(options.findIndex((o) => o.key === currentValue.value.key));

const { disabledSettings } = useSettings();
const disabled = ref(disabledSettings.value[settingKey]);
disabledSettings.subscribe((val) => {
    disabled.value = val[settingKey] ?? false;
});

defineExpose({
    getValue: () => {
        return currentValue.value;
    },
    isDisabled: () => {
        return disabled.value;
    },
    focus: () => {
        focused.value = true;
        captureControls();
        registerInputListeners();
    },
    blur: () => {
        onBlur();
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
        currentValue.value = options[cursorPos.value];
        onSelect(options[cursorPos.value].key);
    }, 'confirm');

    cancel = registerInputListener(() => {
        onBlur();
    }, 'cancel');

    upExit = registerInputListener(() => {
        emit('directionalExit', 'menu_up');
    }, ['movement_up', 'menu_up']);

    downExit = registerInputListener(() => {
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
    <div class="flex flex-row items-center justify-start">
        <div
            v-for="(option, idx) in options"
            :key="option.key"
            class="px-6"
            :class="[
                focused && cursorPos === idx
                    ? 'menu-select-highlight'
                    : currentValue.key === option.key
                      ? 'text-white'
                      : 'text-gray-500',
                true && 'brightness-[.8]',
            ]"
        >
            <div class="relative top-[2px]">
                {{ option.label }}
            </div>
        </div>
    </div>
</template>
