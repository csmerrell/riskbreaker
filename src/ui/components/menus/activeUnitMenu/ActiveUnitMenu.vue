<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';

import type { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import type { PartyMember } from '@/state/useParty';
import ActionItem from './ActionItem.vue';

type Props = {
    unit: PartyMember;
    actor: CompositeActor;
};

defineProps<Props>();

const selectedAction = ref(0);
const actions = ref([
    {
        name: 'Act',
        onSelect: async () => {},
    },
    {
        name: 'Stock',
        onSelect: async () => {},
    },
    {
        name: 'Rest',
        onSelect: async () => {},
    },
]);

const listeners = [
    registerInputListener(() => {
        selectedAction.value = Math.min(selectedAction.value + 1, actions.value.length - 1);
    }, ['menu_down', 'movement_down']),
    registerInputListener(() => {
        selectedAction.value = Math.max(selectedAction.value - 1, 0);
    }, ['menu_up', 'movement_up']),
];

onUnmounted(() => {
    listeners.forEach((id) => unregisterInputListener(id));
});
</script>

<template>
    <div class="relative flex flex-col items-start gap-2">
        <ActionItem label="Act" command="shoulder_right" class="text-standard-md relative left-8" />
        <ActionItem label="Stock" command="hotbarFUp" class="text-standard-md relative left-12" />
        <ActionItem label="Rest" command="hotbarFLeft" class="text-standard-md relative left-16" />
    </div>
</template>
