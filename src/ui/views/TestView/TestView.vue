<script setup lang="ts">
import { useGameContext } from '@/state/useGameContext';
import { ref } from 'vue';

const { game } = useGameContext();

const sceneLoaded = ref(false);
game.value.goToScene('test').then(() => {
    sceneLoaded.value = true;
});
</script>

<template>
    <div></div>
</template>
