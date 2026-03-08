<script setup lang="ts">
import MenuBox from '@/ui/components/MenuBox.vue';
import TurnForecast from './TurnForecast.vue';
import PartyStatus from './PartyStatus.vue';

import { useGameContext } from '@/state/useGameContext';
import { ref, watch } from 'vue';
import { useExploration } from '@/state/useExploration';
import CrossHotbar from './crossHotbar/CrossHotbar.vue';

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
        <div v-if="forecastReady">
            <div class="absolute bottom-16 left-4">
                <TurnForecast />
            </div>
            <div class="absolute bottom-3 right-4">
                <PartyStatus />
            </div>
        </div>
    </Transition>
</template>
