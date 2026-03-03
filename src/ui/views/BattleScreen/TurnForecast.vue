<script setup lang="ts">
import { useExploration } from '@/state/useExploration';
import { computed, ref } from 'vue';
import { getScale } from '@/lib/helpers/screen.helper';
import ForecastedUnit from './ForecastedUnit.vue';

const headshotManager = useExploration().getExplorationManager().battleManager.headshotManager;
const headshots = ref<typeof headshotManager.headshots.value>([]);

headshotManager.headshots.subscribe((val) => {
    headshots.value = val ?? [];
});

const forecasts = computed(() =>
    [...headshots.value, ...headshots.value, ...headshots.value].slice(0, 8),
);
</script>

<template>
    <div class="relative left-2 top-2">
        <ForecastedUnit
            v-for="(forecast, idx) in forecasts"
            :key="`${forecast.id}-${idx}`"
            :forecast
            :style="{
                zIndex: headshots.length - idx,
                marginLeft: `${26 * getScale() * idx}px`,
            }"
        />
    </div>
</template>
