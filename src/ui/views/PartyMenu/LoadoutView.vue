<script setup lang="ts">
import { ref } from 'vue';
import CharacterPreview from './CharacterPreview.vue';
import { useExploration } from '@/state/useExploration.js';
import type { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor.js';

const explorationManager = useExploration().getExplorationManager();
const players = ref(explorationManager.actorManager.getPlayers());
const selectedIdx = ref(0);
const selectedPlayer = players.value[selectedIdx.value] as CompositeActor;
</script>

<template>
    <div class="flex flex-col">
        <div class="flex flex-row">
            <CharacterPreview :character="selectedPlayer" />
        </div>
    </div>
</template>
