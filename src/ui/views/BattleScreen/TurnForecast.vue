<script setup lang="ts">
import { useExploration } from '@/state/useExploration';
import { computed, ref } from 'vue';
import { getScale } from '@/lib/helpers/screen.helper';
import ForecastedUnit from './ForecastedUnit.vue';
import { PartyMember } from '@/state/useParty';
import { EnemyDef } from '@/state/battle/useBattle';
import MenuBox from '@/ui/components/MenuBox.vue';

const { headshotManager, turnManager } = useExploration().getExplorationManager().battleManager;
const headshots = ref<typeof headshotManager.headshots.value>([]);

headshotManager.headshots.subscribe((val) => {
    headshots.value = val ?? [];
});

const ready = ref(false);
turnManager.forecastReady.subscribe((val) => {
    ready.value = !!val;
    if (ready.value) {
    }
});

const forecasts = ref<(EnemyDef | PartyMember)[]>([]);
turnManager.forecast.subscribe((val) => {
    forecasts.value = val ?? [];
});

const visibleForecasts = computed(() => [...forecasts.value].slice(0, 8).reverse());
const activeForecast = computed(() => {
    //TODO - account for temporary targeting highlights
    return visibleForecasts.value.length - 1;
});
</script>

<template>
    <Transition name="fade" :duration="500">
        <div
            v-if="ready"
            class="inset-unset absolute bottom-16 left-4 flex flex-row items-start"
            :style="{ height: `${getScale() * 18}px` }"
        >
            <ForecastedUnit
                v-for="(unit, idx) in visibleForecasts"
                :key="`${unit.id}-${idx}`"
                :active="idx === activeForecast"
                :forecast="{
                    unit,
                    path: headshots.find((hs) => hs.id === unit.id)?.path ?? '',
                }"
                :style="{
                    zIndex: idx,
                    ...(idx < 3 && {
                        marginRight: `${-12 * getScale()}px`,
                    }),
                }"
            />
        </div>
    </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
