<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { resources } from '@/resource';
import { SpriteSheet } from 'excalibur';
import { ref } from 'vue';

type Props = {
    icon: 'dpad' | 'faceButtons';
};

const { icon: iconType } = defineProps<Props>();

const iconSrc = resources.image.controls.crossHotbarCenter;
const iconContainer = ref<HTMLDivElement>();
const ready = ref(false);
if (iconSrc.isLoaded()) {
    ready.value = true;
    appendImg();
} else {
    iconSrc.load().then(() => appendImg());
}

const size = ref((getScale() - 2) * 24);
async function appendImg() {
    const icon = await SpriteSheet.fromImageSource({
        image: iconSrc,
        grid: {
            spriteHeight: 24,
            spriteWidth: 24,
            rows: 1,
            columns: 2,
        },
    }).getSpriteAsImage(iconType === 'dpad' ? 0 : 1, 0);
    icon.style.setProperty('width', `${size.value}px`);
    icon.style.setProperty('height', `${size.value}px`);
    iconContainer.value?.appendChild(icon);
}
</script>

<template>
    <div ref="iconContainer" class="gamepad-icon relative bottom-[2px]"></div>
</template>
