<script setup lang="ts">
import MenuBox from '@/ui/components/MenuBox.vue';
import { ref, watch } from 'vue';
import PlayerReadout from './PlayerReadout.vue';
import { useGameContext } from '@/state/useGameContext';
import { useExploration } from '@/state/useExploration';
import TurnForecast from './TurnForecast.vue';

const { activeView } = useGameContext();

const mockUnits = ref({
    players: [
        {
            name: 'Riskbreaker',
            health: 75,
            maxHealth: 125,
        },
        {
            name: 'Astrologian',
            health: 100,
            maxHealth: 125,
        },
    ],
});
</script>

<template>
    <Transition name="fade" :duration="500">
        <div v-if="activeView === 'battle'">
            <div class="relative size-full">
                <TurnForecast />
            </div>
            <div class="absolute bottom-4 right-4">
                <div class="bg-bg opacity-70">
                    <PlayerReadout :players="mockUnits.players" class="invisible p-2" />
                </div>
                <MenuBox class="flex flex-col gap-2 rounded-br-md rounded-tl-md p-2">
                    <PlayerReadout :players="mockUnits.players" />
                </MenuBox>
            </div>
        </div>
    </Transition>
</template>
