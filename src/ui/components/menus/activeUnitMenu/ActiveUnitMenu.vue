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
    registerInputListener(() => {
        if (moving.value) return;
        moving.value = true;
        const { battleManager } = useExploration().getExplorationManager();
        const destIdx = Math.max(
            0,
            BattleManager.laneKeys.findIndex((l) => l === unit.config.battlePosition) - 1,
        );
        const dest = BattleManager.laneKeys[destIdx];
        if (dest === unit.config.battlePosition) return;

        battleManager.moveUnit(dest, unit, actor).then(() => (moving.value = false));
    }, ['menu_left', 'movement_left']),
    registerInputListener(() => {
        if (moving.value) return;
        moving.value = true;
        const { battleManager } = useExploration().getExplorationManager();
        const destIdx = Math.min(
            BattleManager.laneKeys.length - 1,
            BattleManager.laneKeys.findIndex((l) => l === unit.config.battlePosition) + 1,
        );
        const dest = BattleManager.laneKeys[destIdx];
        if (dest === unit.config.battlePosition) return;

        battleManager.moveUnit(dest, unit, actor).then(() => (moving.value = false));
    }, ['menu_right', 'movement_right']),
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
