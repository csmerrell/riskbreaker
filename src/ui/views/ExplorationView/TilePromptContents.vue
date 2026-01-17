<script setup lang="ts">
import type { TileControlPrompt } from '@/state/useExploration';
import KeySprite from '@/ui/components/KeySprite.vue';

type Props = {
    tileControls: TileControlPrompt;
};
const { tileControls } = defineProps<Props>();
</script>

<template>
    <div
        class="text-standard-sm relative flex flex-col items-start justify-center gap-4 whitespace-nowrap p-4 pr-6 pt-6 text-white"
    >
        <div class="text-tiny-sm absolute right-2 top-1 text-orange-300">Debug</div>
        Map Interactions
        <div>
            <div
                v-for="prompt in tileControls.commands"
                :key="`${prompt.command}`"
                class="flex flex-row items-center justify-start gap-2 pl-2"
                :class="!prompt.command && 'mb-2'"
            >
                <span :class="prompt.labelColor ?? 'text-white'">
                    {{ prompt.label }}
                </span>
                <KeySprite v-if="prompt.command" :command="prompt.command" :scale="0.75" />
            </div>
        </div>
    </div>
</template>
