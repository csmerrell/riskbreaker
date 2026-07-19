<script setup lang="ts">
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { useExploration } from '@/state/useExploration';
import { useGameContext } from '@/state/useGameContext';
import { Actor, Graphic, ImageSource, Sprite, vec } from 'excalibur';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

type Props = {
    character: CompositeActor;
};
const { character } = defineProps<Props>();
const root = ref<HTMLDivElement>();
const scene = useExploration().getExplorationManager().scene;

const showCaseSrc = new ImageSource('/image/misc/GrassShowcase.png');
const showCaseRdy = ref(false);
const showCaseSprite = ref<Sprite>();
const size = ref<{ w: number; h: number }>({ w: 0, h: 0 });
showCaseSrc.load().then(() => {
    showCaseSprite.value = showCaseSrc.toSprite();
    size.value.w = showCaseSprite.value.width;
    size.value.h = showCaseSprite.value.height;
    showCaseRdy.value = true;
    console.log('sprite loaded');
});
const mounted = ref(false);

function getCoordinates() {
    const engine = useGameContext().game.value;
    const { x, y, width, height } = root.value!.getBoundingClientRect();
    const xMid = x + width / 2;
    const yMid = y - height / 2;
    const worldCenter = engine.screenToWorldCoordinates(vec(xMid, yMid));
    debugger;
    return worldCenter;
}
function addCharacterToScene() {
    const center = getCoordinates();
    const scene = useExploration().getExplorationManager().scene;
    const bgActor = new Actor();
    bgActor.pos = center;
    bgActor.graphics.add(showCaseSprite.value!);
    scene.add(bgActor);
}
onMounted(() => {
    mounted.value = true;
});

onBeforeUnmount(() => (mounted.value = false));

watch([showCaseRdy, mounted], () => {
    if (showCaseRdy.value && mounted.value) addCharacterToScene();
});
</script>

<template>
    <div
        id="character-preview"
        ref="root"
        :style="{ height: `${size.h}px`, width: `${size.w}px` }"
    ></div>
</template>
