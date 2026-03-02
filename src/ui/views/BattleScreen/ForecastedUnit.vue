<script setup lang="ts">
import MenuBox from '@/ui/components/MenuBox.vue';
type Props = {
    forecast: { path: string; id: number };
};

const { forecast } = defineProps<Props>();
console.log(forecast);
debugger;
</script>

<template>
    <MenuBox class="text-standard-md inset-[unset] bg-bg text-white">
        Forecast
        <img :src="forecast.path" />
    </MenuBox>
</template>
