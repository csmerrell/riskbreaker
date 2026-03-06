<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { resources } from '@/resource';
import { SpriteSheet, vec, Vector } from 'excalibur';
import { onMounted, ref } from 'vue';

type Props = {
    row?: number;
    col?: number;
    scale?: Vector;
};

const { row, col, scale = vec(1, 1) } = defineProps<Props>();

const imgSrc = ref<string>();

onMounted(() => {
    if (row && col) {
        console.log('Row: ', row, ' | Col: ', col);
        const imageElement = SpriteSheet.fromImageSource({
            image: resources.image.icons.skills,
            grid: {
                spriteHeight: 24,
                spriteWidth: 24,
                rows: 10,
                columns: 6,
            },
        }).getSprite(row, col, { scale });
        imgSrc.value = imageElement.src;
    }
});
</script>

<template>
    <div
        class="hotbar-box flex flex-col items-center justify-center rounded-md bg-bg-alt p-1"
        :style="{
            height: `${~~(getScale() / 2) * 24}px`,
            width: `${~~(getScale() / 2) * 24}px`,
        }"
    >
        <img v-if="imgSrc" :src="imgSrc" alt="" />
    </div>
</template>

<style>
.hotbar-box {
    box-shadow:
        inset 0.15em 0.15em 0.15em 0 rgba(255, 255, 255, 0.05),
        inset -0.15em -0.15em 0.15em 0 rgba(0, 0, 0, 0.35);
}
</style>
