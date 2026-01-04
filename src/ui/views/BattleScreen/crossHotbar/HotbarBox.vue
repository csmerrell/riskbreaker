<script setup lang="ts">
import { HotbarAction } from '../state/useCrossHotbar';

type Props = {
    focused: boolean;
    action?: HotbarAction;
};

const { focused, action } = defineProps<Props>();
</script>

<template>
    <div
        class="hotbar-box flex size-[3em] flex-col items-center justify-center rounded-md bg-gray-800 p-1"
    >
        <div v-if="action" class="relative flex size-full flex-col items-center justify-center">
            <img :src="action.imgPath" class="scale-[3]" />
            <span v-if="focused" class="text-standard-md absolute -bottom-2 text-white">
                {{ action.name }}
            </span>
        </div>
    </div>
</template>

<style>
.hotbar-box {
    box-shadow:
        inset 0.15em 0.15em 0.15em 0 rgba(255, 255, 255, 0.05),
        inset -0.15em -0.15em 0.15em 0 rgba(0, 0, 0, 0.35);
}
</style>
