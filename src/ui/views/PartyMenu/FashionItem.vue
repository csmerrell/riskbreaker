<script setup lang="ts">
import { FashionMenuItem } from './FashionSettings.vue';
import FashionSlotSelector from './FashionSlotSelector.vue';

type Props = {
    item: FashionMenuItem;
    focused: boolean;
};

const { item, focused } = defineProps<Props>();
</script>

<template>
    <template v-if="focused">
        <div class="relative left-8 mb-2 skew-x-[42deg] bg-yellow-500 px-2">
            <div class="flex skew-x-[-42deg] flex-col items-start">
                <div class="relative left-2 z-10 -mb-2 font-bold text-rose-700">
                    {{ item.label }}
                </div>
                <FashionSlotSelector :type="item.key" />
            </div>
        </div>
    </template>
    <template v-else>
        <div class="py-1 pl-4 pr-16">
            <div class="flex flex-row gap-6">
                <div class="font-bold text-rose-700">{{ item.label }}:</div>
                <div class="font-bold">
                    {{ item.value }}
                </div>
            </div>
        </div>
    </template>
</template>

<style scoped>
.double-fade-bg {
    background: linear-gradient(
        90deg,
        transparent 0%,
        var(--yellow-500) 20%,
        var(--yellow-500) 80%,
        transparent 100%
    );
}
</style>
