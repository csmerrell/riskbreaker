<script setup lang="ts">
import TurnForecast from './TurnForecast.vue';
import PartyStatus from './PartyStatus.vue';

import { useGameContext } from '@/state/useGameContext';
import { ref, watch } from 'vue';
import { useBattle } from '@/state/battle/useBattle';

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
    const { turnManager } = useBattle().getBattleManager();
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
