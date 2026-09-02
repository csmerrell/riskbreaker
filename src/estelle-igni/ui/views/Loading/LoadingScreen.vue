<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

const dots = ref('');
const interval = setInterval(() => {
    dots.value += '.';
    if (dots.value.length > 3) {
        dots.value = '';
    }
}, 1000);

onUnmounted(() => {
    clearInterval(interval);
});
</script>

<template>
    <div class="size-full">
        <div class="flex size-full flex-col items-center justify-center text-white">
            <div class="flex flex-col items-stretch gap-1">
                <div class="text-standard-md flex flex-row justify-center gap-1 text-white">
                    Loading
                    <div class="relative">
                        <div class="invisible">...</div>
                        <div class="absolute inset-0">{{ dots }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
