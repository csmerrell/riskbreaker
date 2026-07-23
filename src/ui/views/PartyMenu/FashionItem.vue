<script setup lang="ts">
import { FashionMenuItem } from './FashionSettings.vue';

type Props = {
    item: FashionMenuItem;
    focused: boolean;
};

const { item, focused } = defineProps<Props>();
</script>

<template>
    <div class="skew-x-[42deg] pl-4 pr-16" :class="focused && 'bg-yellow-500'">
        <div class="flex skew-x-[-42deg] flex-row gap-6">
            <div class="font-bold" :class="focused ? 'text-black' : 'text-rose-700'">
                {{ item.label }}:
            </div>
            <div class="font-bold" :class="focused && 'text-black'">
                {{ item.value }}
            </div>
        </div>
    </div>
</template>
