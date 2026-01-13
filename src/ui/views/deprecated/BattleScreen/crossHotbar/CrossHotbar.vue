<script setup lang="ts">
import {
    CrossHotbarCommand,
    HotbarAction,
    HotbarActionSet,
    useCrossHotbar,
} from '../state/useCrossHotbar';
import HotbarSet from './HotbarSet.vue';
import {
    registerHoldListener,
    registerInputListener,
    unregisterInputListener,
} from '@/game/input/useInput';
import { computed, ref, watch } from 'vue';
import { useBattleParty } from '@/state/deprecated/useBattleParty';

const { currentHotbar } = useCrossHotbar();

const focusRight = ref(false);
const focusLeft = ref(false);
const someFocus = computed(() => focusRight.value || focusLeft.value);

const shoulderListener = ref<string | undefined>();
watch(currentHotbar, () => {
    if (currentHotbar.value) {
        shoulderListener.value = registerHoldListener((commands) => {
            focusRight.value =
                commands.shoulder_right !== undefined &&
                (focusRight.value || commands.shoulder_left === undefined);
            focusLeft.value =
                commands.shoulder_left !== undefined &&
                (focusLeft.value || commands.shoulder_right === undefined);
        });
    } else {
        focusRight.value = false;
        focusLeft.value = false;
    }
});

const commandKeys: CrossHotbarCommand[] = [
    'hotbarDDown',
    'hotbarDRight',
    'hotbarDUp',
    'hotbarDLeft',
    'hotbarFDown',
    'hotbarFUp',
    'hotbarFRight',
    'hotbarFLeft',
];
const listeners = ref<string[]>([]);
function registerListeners() {
    if (listeners.value.length > 0) {
        return;
    }
    commandKeys.forEach((command) => {
        listeners.value.push(
            registerInputListener(() => {
                const { lockMenuToActiveActor } = useBattleParty();
                if (!someFocus.value) {
                    if (lockMenuToActiveActor.value) {
                        return false;
                    } else {
                        return true;
                    }
                }
                const hotbarSet = focusRight.value
                    ? currentHotbar.value.rightSet
                    : focusLeft.value
                      ? currentHotbar.value.leftSet
                      : ({} as HotbarActionSet);
                const action = hotbarSet[command] ?? ({} as HotbarAction);
                currentHotbar.value.selectAction(action);
                return true;
            }, command),
        );
    });
}

function unregisterListeners() {
    listeners.value.forEach((listenerId) => {
        unregisterInputListener(listenerId);
    });
    listeners.value = [];
}

watch(currentHotbar, () => {
    if (currentHotbar.value) {
        registerListeners();
    } else {
        unregisterListeners();
    }
});
</script>

<template>
    <div v-if="currentHotbar" class="cross-hotbar flex flex-row items-center self-center px-12">
        <HotbarSet
            :actions="currentHotbar.leftSet"
            :focused="focusLeft"
            :class="focusRight ? 'text-[.75em]' : ''"
        />
        <div class="h-16 border-l border-gray-700" />
        <HotbarSet
            :actions="currentHotbar.rightSet"
            :focused="focusRight"
            :class="focusLeft ? 'text-[.75em]' : ''"
        />
    </div>
</template>
