<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';

import MenuBox from '@/ui/components/MenuBox.vue';
import ActionList from './ActionList.vue';

import type { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import type { PartyMember } from '@/state/useParty';
import KeySprite from '../../KeySprite.vue';
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
    <div class="relative">
        <ActionItem
            label="Act"
            command="shoulder_right"
            class="text-standard-md absolute bottom-6 left-10"
        />
        <ActionItem
            label="Stock"
            command="context_menu_1"
            class="text-standard-md absolute bottom-0 left-12"
        />
    </div>
</template>
