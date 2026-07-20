<script setup lang="ts">
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { getScale, getWorldCoords } from '@/lib/helpers/screen.helper';
import { useExploration } from '@/state/useExploration';
import ControlIconSprite from '@/ui/components/ControlIconSprite.vue';
import MenuBox from '@/ui/components/MenuBox.vue';
import { Actor, ImageSource, Sprite, vec } from 'excalibur';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useSelectedCharacter } from './useSelectedCharacter';

const root = ref<HTMLDivElement>();

const showCaseSrc = new ImageSource('/image/misc/GrassShowcase.png');
const showCaseRdy = ref(false);
const showCaseSprite = ref<Sprite>();
const size = ref<{ w: number; h: number }>({ w: 0, h: 0 });
function setSize() {
    showCaseSprite.value = showCaseSrc.toSprite();
    size.value.w = showCaseSprite.value.width * getScale();
    size.value.h = showCaseSprite.value.height * getScale() * 0.75;
    showCaseRdy.value = true;
}
if (showCaseSrc.isLoaded()) {
    setSize();
} else {
    showCaseSrc.load().then(setSize);
}

const mounted = ref(false);

function getPreviewCenter() {
    const { left, top } = root.value!.getBoundingClientRect();
    const xMid = left + size.value.w / 2;
    const yMid = top + size.value.h / 4;
    const worldCenter = getWorldCoords(vec(xMid, yMid));
    return worldCenter;
}
const scene = useExploration().getExplorationManager().scene;
const bgActor = new Actor();
const ready = ref(false);
function addBgToScene() {
    const center = getPreviewCenter();
    bgActor.pos = center;
    bgActor.z = 1000;
    bgActor.scale = vec(1, 1).scale(1 - 1 / getScale());
    bgActor.graphics.add(showCaseSprite.value!);
    scene.add(bgActor);
}

const { selectedMember, changeSelectedMember } = useSelectedCharacter();
let player = new CompositeActor(selectedMember.value);
function addPlayerToScene() {
    player.z = 1001;
    player.scale = vec(-1, 1);
    player.pos = getPreviewCenter().add(vec(-2, 8));
    scene.add(player);
}

function changePlayer() {
    scene.remove(player);
    player = new CompositeActor(selectedMember.value);
    addPlayerToScene();
}
watch(selectedMember, changePlayer);

const emit = defineEmits(['ready']);
function hydrateScene() {
    addBgToScene();
    addPlayerToScene();
    ready.value = true;
    emit('ready', ready.value);
}

function cleanup() {
    scene.remove(bgActor);
    scene.remove(player);
    ready.value = false;
    emit('ready', ready.value);
}

let listeners: string[] = [];
onMounted(() => {
    listeners = [
        registerInputListener(() => changeSelectedMember('left'), 'tab_left'),
        registerInputListener(() => changeSelectedMember('right'), 'tab_right'),
    ];
    mounted.value = true;
});

onBeforeUnmount(() => {
    cleanup();
    mounted.value = false;
    listeners.forEach((l) => {
        unregisterInputListener(l);
    });
});

const { maskReady } = useExploration().getExplorationManager().partyMenuManager;
watch([showCaseRdy, mounted, maskReady], () => {
    if (showCaseRdy.value && mounted.value && maskReady.value) hydrateScene();
    else if (!maskReady.value) cleanup();
});
</script>

<template>
    <div
        id="character-preview"
        ref="root"
        class="relative"
        :style="{ height: `${size.h}px`, width: `${size.w}px` }"
    >
        <template v-if="ready">
            <div class="absolute -inset-4 z-10">
                <div
                    class="absolute h-full bg-bg opacity-80"
                    :style="{ right: 'calc(100% - 2rem)', width: '100vw' }"
                />
                <div
                    class="absolute h-full bg-bg opacity-80"
                    :style="{ left: 'calc(100% - 1rem)', width: '100vw' }"
                />
                <div
                    class="absolute top-full bg-bg opacity-80"
                    :style="{ width: 'calc(200vw + 1rem)', height: '100vh' }"
                />
                <MenuBox :poles="{}" class="bottom-4 left-8 right-4 border-2 border-t-0" />
            </div>
            <MenuBox
                class="left-1/2 z-20 h-6 w-11/12 translate-x-[-48%] bg-bg-dark"
                :style="{ top: 'calc(100% - 0.75rem)' }"
                :poles="{ NW: true, SW: true, SE: true, NE: true }"
            >
                <div
                    class="text-standard-md my-auto flex h-full flex-row items-center justify-around gap-8 text-white"
                >
                    <ControlIconSprite command="tab_left" size="xs" class="relative top-1" />
                    <span class="relative top-0.5">{{ selectedMember.name }}</span>
                    <ControlIconSprite command="tab_right" size="xs" class="relative top-1" />
                </div>
            </MenuBox>
        </template>
    </div>
</template>
