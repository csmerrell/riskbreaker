<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import ForecastedUnit from './ForecastedUnit.vue';
import { useExploration } from '@/state/useExploration';
import { computed, ref } from 'vue';
import MenuBox from '@/ui/components/MenuBox.vue';

const battleManager = useExploration().getExplorationManager().battleManager;
const headshots = ref<typeof battleManager.headshots.value>([]);

battleManager.headshots.subscribe((val) => {
    headshots.value = val ?? [];
});

const forecasts = computed(() =>
    [...headshots.value, ...headshots.value, ...headshots.value, ...headshots.value].slice(0, 8),
);
</script>

<template>
    <div class="relative">
        <MenuBox v-if="headshots.length > 0" class="right-0 z-[9999] h-[390px] w-[700px] bg-bg">
            ????
            <img :src="headshots[0].path" />
        </MenuBox>
        <!-- <ForecastedUnit
            v-for="(forecast, idx) in forecasts"
            :key="`${forecast.id}-${idx}`"
            :forecast
            :style="{
                zIndex: headshots.length - idx,
                marginTop: `${24 * getScale() * idx}px`,
            }"
        /> -->
    </div>
</template>
