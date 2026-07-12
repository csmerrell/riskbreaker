<script setup lang="ts">
import { computed, ref } from 'vue';
import { useInput } from '@/game/input/useInput';
import TilePrompts from './TilePrompts.vue';
import HotbarSet from '@/ui/components/menus/crossHotbar/HotbarSet.vue';
import { AstrologianDefault } from '@/state/defaults/party.js';
import { useGameContext } from '@/state/useGameContext.js';

const { stackOwner } = useInput();

const inputKey = ref();
const inputOwner = ref(stackOwner.value);
stackOwner.subscribe(() => {
    inputOwner.value = stackOwner.value;
});
const hasControl = computed(() => inputOwner.value === inputKey.value);

const activeView = useGameContext().activeView;
</script>

<template>
    <div class="relative size-full">
        <TilePrompts v-if="hasControl" />
        <HotbarSet
            v-if="activeView === 'exploration'"
            class="fixed bottom-4 left-4 z-50"
            :gate-button="'shoulder_left'"
            :quads="['faceButton']"
            :unit="AstrologianDefault"
            side="right"
        />
    </div>
</template>
