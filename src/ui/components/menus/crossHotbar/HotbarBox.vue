<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { onMounted, ref } from 'vue';
import { useIcons } from './useIcons';

type Props = {
    type: 'skill' | 'menu';
    col?: number;
    row?: number;
};

const { type, col, row } = defineProps<Props>();

const imgContainer = ref<HTMLDivElement>();
const size = ref((getScale() - 2) * (type === 'skill' ? 24 : 32));

if (col !== undefined && row !== undefined) {
    onMounted(async () => {
        let imageEl: HTMLImageElement;
        switch (type) {
            case 'skill':
                imageEl = await useIcons().getSkillIcon(col, row);
                break;
            case 'menu':
            default:
                imageEl = await useIcons().getMenuIcon(col, row);
                break;
        }
        imageEl.style.setProperty('width', `${size.value}px`);
        imageEl.style.setProperty('height', `${size.value}px`);
        imgContainer.value?.appendChild(imageEl);
    });
}
</script>

<template>
    <div
        ref="imgContainer"
        class="hotbar-box overflow-hidden rounded-sm"
        :style="{
            height: `${size}px`,
            width: `${size}px`,
            backgroundColor: 'rgb(from var(--bg-alt) r g b / 0.7)',
        }"
    />
</template>

<style>
.hotbar-box {
    box-shadow:
        inset 0.15em 0.15em 0.15em 0 rgba(255, 255, 255, 0.05),
        inset -0.15em -0.15em 0.15em 0 rgba(0, 0, 0, 0.35);
}
</style>
