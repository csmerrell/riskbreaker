<script setup lang="ts">
import { computed, ref } from 'vue';
import { useInput } from '@/game/input/useInput';
import TilePrompts from './TilePrompts.vue';

const { stackOwner } = useInput();

const inputKey = ref();
const inputOwner = ref(stackOwner.value);
stackOwner.subscribe(() => {
    inputOwner.value = stackOwner.value;
});
const hasControl = computed(() => inputOwner.value === inputKey.value);
</script>

<template>
    <div class="relative size-full">
        <TilePrompts v-if="hasControl" />
    </div>
</template>
