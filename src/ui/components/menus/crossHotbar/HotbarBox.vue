<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { resources } from '@/resource';
import { SpriteSheet } from 'excalibur';
import { onMounted, ref } from 'vue';

type Props = {
    row?: number;
    col?: number;
    name?: string;
    focused?: boolean;
};

const { row, col, name, focused = false } = defineProps<Props>();

const imgContainer = ref<HTMLDivElement>();
const size = ref((getScale() - 2) * 24);
onMounted(async () => {
    if (row && col) {
        const imageEl = await SpriteSheet.fromImageSource({
            image: resources.image.icons.skills,
            grid: {
                spriteHeight: 24,
                spriteWidth: 24,
                rows: 6,
                columns: 10,
            },
        }).getSpriteAsImage(col, row);
        imageEl.style.setProperty('width', `${size.value}px`);
        imageEl.style.setProperty('height', `${size.value}px`);
        imgContainer.value?.appendChild(imageEl);
    }
});
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
