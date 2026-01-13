<script setup lang="ts">
import { getScale } from '@/lib/helpers/screen.helper';
import { makeState } from '@/state/Observable';
import { onMounted, onUnmounted } from 'vue';

type LaneId = 'left' | 'leftMid' | 'mid' | 'rightMid' | 'right';

// Track which lanes are currently pulsing
const pulsingLanes = makeState(new Set<LaneId>());

// Methods to control lane pulsing
function startPulse(laneId: LaneId) {
    pulsingLanes.value.add(laneId);
}

function stopPulse(laneId: LaneId) {
    pulsingLanes.value.delete(laneId);
}

function stopAllPulses() {
    pulsingLanes.value.clear();
}

// Expose methods for parent components
defineExpose({
    startPulse,
    stopPulse,
    stopAllPulses,
});

onMounted(() => {
    adjustScale();
    window.addEventListener('resize', adjustScale);
});

onUnmounted(() => {
    window.removeEventListener('resize', adjustScale);
});

function adjustScale() {
    document.getElementById('tile-container').style.setProperty('--scale', `${getScale()}`);
}
</script>

<template>
    <div id="tile-container">
        <!-- <div
            v-for="(pos, idx) in positions.value.left[3]"
            :key="idx"
            class="faux-unit absolute z-[100] border-4 border-blue-500 bg-red-500"
            :style="{ ['--left']: `${pos.x}px`, ['--top']: `${pos.y}px` }"
        />
        <div
            v-for="(pos, idx) in positions.value.leftMid[3]"
            :key="idx"
            class="faux-unit absolute z-[100] border-4 border-blue-500 bg-red-500"
            :style="{ ['--left']: `${pos.x}px`, ['--top']: `${pos.y}px` }"
        />
        <div
            v-for="(pos, idx) in positions.value.mid[3]"
            :key="idx"
            class="faux-unit absolute z-[100] border-4 border-blue-500 bg-red-500"
            :style="{ ['--left']: `${pos.x}px`, ['--top']: `${pos.y}px` }"
        />
        <div
            v-for="(pos, idx) in positions.value.rightMid[3]"
            :key="idx"
            class="faux-unit absolute z-[100] border-4 border-blue-500 bg-red-500"
            :style="{ ['--left']: `${pos.x}px`, ['--top']: `${pos.y}px` }"
        />
        <div
            v-for="(pos, idx) in positions.value.right[3]"
            :key="idx"
            class="faux-unit absolute z-[100] border-4 border-blue-500 bg-red-500"
            :style="{ ['--left']: `${pos.x}px`, ['--top']: `${pos.y}px` }"
        /> -->
        <img
            src="/image/battle/Left.png"
            class="battle-image z-20"
            :class="{ 'pulse-selection': pulsingLanes.value.has('left') }"
        />
        <img
            src="/image/battle/LeftMid.png"
            class="battle-image z-20"
            :class="{ 'pulse-selection': pulsingLanes.value.has('leftMid') }"
        />
        <img
            src="/image/battle/Mid.png"
            class="battle-image z-20"
            :class="{ 'pulse-selection': pulsingLanes.value.has('mid') }"
        />
        <img
            src="/image/battle/RightMid.png"
            class="battle-image z-20"
            :class="{ 'pulse-selection': pulsingLanes.value.has('rightMid') }"
        />
        <img
            src="/image/battle/Right.png"
            class="battle-image z-20"
            :class="{ 'pulse-selection': pulsingLanes.value.has('right') }"
        />
        <img src="/image/battle/GrassRing.png" class="battle-image z-30" />
    </div>
</template>

<style>
#tile-container {
    --scale: 2;
}

#left-tile {
    left: calc(32px * var(--scale));
    top: calc(92px * var(--scale));
    height: calc(34px * var(--scale));
    width: calc(47px * var(--scale));
    transform: skewX(-27deg);
    background-color: red;
}

.faux-unit {
    left: calc(var(--left) * var(--scale));
    top: calc(var(--top) * var(--scale));
    height: calc(24px * var(--scale));
    width: calc(24px * var(--scale));
}

.battle-image {
    transition: filter 0.3s ease-in-out;
}

.pulse-selection {
    animation: pulse-light-blue 1.5s ease-in-out infinite;
}

@keyframes pulse-light-blue {
    0% {
        filter: hue-rotate(0deg) brightness(1) opacity(1);
    }
    50% {
        filter: hue-rotate(180deg) brightness(1.4) opacity(0.8);
    }
    100% {
        filter: hue-rotate(0deg) brightness(1) opacity(1);
    }
}
</style>
