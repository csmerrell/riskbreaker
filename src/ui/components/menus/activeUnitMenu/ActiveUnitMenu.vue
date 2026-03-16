<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

import {
    registerHoldListener,
    registerInputListener,
    unregisterInputListener,
} from '@/game/input/useInput';

import type { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import type { PartyMember } from '@/state/useParty';
import ActionItem from './ActionItem.vue';
import { useExploration } from '@/state/useExploration';
import { BattleManager } from '@/state/battle/BattleManager';

type Props = {
    unit: PartyMember;
    actor: CompositeActor;
};

const { unit, actor } = defineProps<Props>();

const actPressed = ref(false);
const stockPressed = ref(false);
const restPressed = ref(false);
const moving = ref(false);
let bufferedDirection: 'left' | 'right' | null = null;
let acceptBufferAfter = 0;

const handleMovement = (direction: 'left' | 'right') => {
    const now = Date.now();

    // If moving and buffer window not open, buffer this input
    if (moving.value && now < acceptBufferAfter) {
        return;
    }

    // If moving and buffer window is open, buffer this input
    if (moving.value) {
        bufferedDirection = direction;
        return;
    }

    // Execute movement
    moving.value = true;
    const { battleManager } = useExploration().getExplorationManager();
    const currentIdx = BattleManager.laneKeys.findIndex((l) => l === unit.config.battlePosition);
    const destIdx =
        direction === 'left'
            ? Math.max(0, currentIdx - 1)
            : Math.min(BattleManager.laneKeys.length - 1, currentIdx + 1);
    const dest = BattleManager.laneKeys[destIdx];

    if (dest === unit.config.battlePosition) {
        moving.value = false;
        return;
    }

    const result = battleManager.moveUnit(dest, unit, actor);

    // Open buffer window at duration/2
    acceptBufferAfter = now + result.duration / 2;

    void result.promise.then(() => {
        moving.value = false;

        // Execute buffered input if one exists
        if (bufferedDirection) {
            const nextDirection = bufferedDirection;
            bufferedDirection = null;
            handleMovement(nextDirection);
        }
    });
};

const listeners = [
    registerHoldListener((inputs) => {
        if (inputs.shoulder_left || inputs.shoulder_right) {
            actPressed.value = true;
        } else {
            actPressed.value = false;
        }
    }),
    registerInputListener(() => {
        if (stockPressed.value) {
            return;
        }
        stockPressed.value = true;
        setTimeout(() => {
            stockPressed.value = false;
        }, 125);
    }, 'context_menu_1'),
    registerInputListener(() => {
        if (restPressed.value) {
            return;
        }
        restPressed.value = true;
        setTimeout(() => {
            restPressed.value = false;
        }, 125);
    }, 'inspect_details'),
    registerInputListener(() => handleMovement('left'), ['menu_left', 'movement_left']),
    registerInputListener(() => handleMovement('right'), ['menu_right', 'movement_right']),
];

onUnmounted(() => {
    listeners.forEach((l) => unregisterInputListener(l));
});
</script>

<template>
    <div class="relative flex flex-col items-start gap-2">
        <ActionItem
            label="Act"
            :active="actPressed"
            command="shoulder_right"
            class="text-standard-md relative left-8"
        />
        <ActionItem
            label="Stock"
            :active="stockPressed"
            command="hotbarFUp"
            class="text-standard-md relative left-12"
        />
        <ActionItem
            label="Rest"
            :active="restPressed"
            command="hotbarFLeft"
            class="text-standard-md relative left-16"
        />
    </div>
</template>
