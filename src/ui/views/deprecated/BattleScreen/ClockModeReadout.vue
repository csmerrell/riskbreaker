<script setup lang="ts">
import { useActionBus } from '@/state/deprecated/useActionBus';
import { ref } from 'vue';
import ClockModeIcon from './ClockModeIcon.vue';

const { battleClock } = useActionBus();
battleClock.subscribe(() => {
    clockRef.value = battleClock.value;
});
const clockRef = ref<typeof battleClock.value>(battleClock.value ?? '1x');
</script>

<template>
    <div class="flex h-full flex-row items-center px-8 pb-2">
        <div class="text-standard-sm flex flex-row justify-center gap-1">
            <ClockModeIcon icon="picon-pause" :selected="clockRef === 'fullWait'" text="Wait" />
            <span class="text-lg text-gray-700">•</span>
            <ClockModeIcon icon="picon-next" :selected="clockRef === 'liteWait'" text="Semi-Wait" />
            <span class="text-lg text-gray-700">•</span>
            <ClockModeIcon icon="picon-play" :selected="clockRef === '1x'" text="Auto: 1x" />
            <span class="text-lg text-gray-700">•</span>
            <ClockModeIcon :selected="clockRef === '2x'" text="Auto: 2x">
                <div class="min-w-6">
                    <span class="picon-play inline-block w-2" />
                    <span class="picon-play inline-block w-2" />
                </div>
            </ClockModeIcon>
        </div>
    </div>
</template>
