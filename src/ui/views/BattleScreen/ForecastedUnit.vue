<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import MenuBox from '@/ui/components/MenuBox.vue';
type Props = {
    forecast: { path: string; id: number };
};

const { forecast } = defineProps<Props>();
console.log(forecast);
debugger;
</script>

<template>
    <MenuBox
        class="text-standard-md inset-[unset] overflow-hidden bg-bg text-white"
        :style="{ height: `${12 * getScale()}px`, width: `${24 * getScale()}px` }"
    >
        <img :src="forecast.path" />
    </MenuBox>
</template>
