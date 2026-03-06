<script setup lang="ts">
import MenuBox from '@/ui/components/MenuBox.vue';
import TurnForecast from './TurnForecast.vue';
import PartyStatus from './PartyStatus.vue';

import { useGameContext } from '@/state/useGameContext';
import { ref, watch } from 'vue';
import { useExploration } from '@/state/useExploration';

const { activeView } = useGameContext();

watch(activeView, (val) => {
    if (val === 'battle') {
        mount();
    } else {
        //unmount();
    }
});

const forecastReady = ref(false);
function mount() {
    const { turnManager } = useExploration().getExplorationManager().battleManager;
    forecastReady.value = turnManager.forecastReady.value;
    turnManager.forecastReady.subscribe((val) => {
        forecastReady.value = !!val;
    });
}
</script>

<template>
    <Transition name="fade" :duration="500">
        <div v-if="activeView === 'battle'">
            <div class="relative size-full">
                <Transition name="fade" :duration="500">
                    <TurnForecast v-if="forecastReady" />
                </Transition>
            </div>
            <div class="absolute bottom-4 right-4">
                <div class="bg-bg opacity-70">
                    <PartyStatus class="invisible p-2" />
                </div>
                <MenuBox class="flex flex-col gap-2 rounded-br-md rounded-tl-md p-2">
                    <PartyStatus />
                </MenuBox>
            </div>
        </div>
    </Transition>
</template>
