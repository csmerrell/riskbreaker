<script setup lang="ts">
import { onMounted, ref } from 'vue';

const imgNativeResolution = { w: 320, h: 180 };
const targetScale = ref({ w: 1920, f: '18px', l: 1080 });
const scale = ref(1);
function setScale() {
    //match the first scale values that match the closest window width
    targetScale.value = [
        { w: 960, f: '12px', l: 360 }, //scale 3
        { w: 1280, f: '14px', l: 540 }, //scale 4
        { w: 1600, f: '16px', l: 720 }, //scale 5
        { w: 1920, f: '18px', l: 900 }, //scale 6
        { w: 3840, f: '24px', l: 1080 }, //scale 12
    ].find((s) => s.w > window.innerWidth)!;
    scale.value = targetScale.value.w / imgNativeResolution.w;

    document.body.style.setProperty('--target-resolution-width', `${targetScale.value.w}px`);
    document.body.style.setProperty('font-size', targetScale.value.f);
    document.body.style.setProperty('--logo-width', `${targetScale.value.l}px`);
}
window.addEventListener('resize', setScale);
const logo = ref<HTMLImageElement>();
onMounted(() => {
    setScale();
    setTimeout(() => {
        logo.value?.classList.add('fade-in');
    }, 500);
});
</script>

<template>
    <div class="app-mockup fixed inset-0 z-10 bg-bg">
        <div
            class="flex h-8 flex-row items-center justify-center border-b-2 border-zinc-800 bg-zinc-900 text-white"
        >
            NAV?
        </div>
        <div class="relative size-full">
            <div class="header-img relative left-1/2 -translate-x-1/2">
                <div
                    v-show="targetScale.w >= 1280"
                    class="h-fade-bg absolute -left-8 top-0 h-full w-16"
                />
                <img src="/blog/LibraryHero.png" class="header-img" />
                <img
                    ref="logo"
                    src="/blog/Logo.svg"
                    class="logo absolute -top-4 left-1/2 -translate-x-1/2 opacity-0"
                />
                <div
                    v-show="targetScale.w >= 1280"
                    class="h-fade-bg absolute -right-8 top-0 h-full w-16"
                />
            </div>
            <div class="v-fade-bg relative -top-4 h-8 w-full" />
            <div class="flex flex-col items-center justify-center gap-4 text-lg text-white">
                <p class="max-w-[800px] text-center">
                    The stars flicker and fade. Eyes watch us through rifts in the eternal night.
                </p>
                <p class="max-w-[800px] text-center">
                    Grab a tome, kindle your lantern, and step into the dark. Join the scholars of
                    the final star as they unearth the truth of a calamity that slowly fractured
                    their sky.
                </p>
            </div>
        </div>
    </div>
</template>

<style>
body {
    --target-resolution-width: 1920px;
    --logo-width: 540px;
    margin: 0;
}

.v-fade-bg {
    background: linear-gradient(0deg, transparent 0%, rgba(21, 29, 40, 1) 50%, transparent 100%);
}
.h-fade-bg {
    background: linear-gradient(90deg, transparent 0%, rgba(21, 29, 40, 1) 50%, transparent 100%);
}

.header-img {
    width: var(--target-resolution-width);
    max-width: 1280px;
}

.fade-in {
    transition: opacity 2s ease-in;
    opacity: 1 !important;
}

.logo {
    width: var(--logo-width);
    max-width: 540px;
    background: radial-gradient(
        ellipse 60% 40% at center,
        transparent 0%,
        rgba(var(--bg-dark-rgb, 0.8)) 50%,
        transparent 100%
    );
}
</style>
