<script setup lang="ts">
import { PartyMenuTab } from '@/state/useExploration';
import { computed } from 'vue';
import { useNightSky } from './useNightSky';

type Props = {
    activeTabName: PartyMenuTab;
};
const { activeTabName: activeTab } = defineProps<Props>();

const { positions } = useNightSky();
const tabPositions = computed(() => positions.value[activeTab]);

const anchorStyles = computed(() => {
    return {
        right: `${window.innerWidth - (tabPositions.value.anchor?.x ?? 0)}px`,
        top: `${tabPositions.value.anchor?.y ?? 0}px`,
    };
});

const show = computed(() => {
    return (
        [
            tabPositions.value.anchor,
            tabPositions.value.moon,
            ...(tabPositions.value.stars ?? []),
            tabPositions.value.peopleAnchor,
        ].length > 0
    );
});
</script>

<template>
    <div v-show="show" class="fixed inset-0 z-[1000]">
        <div class="absolute" :style="anchorStyles">
            <div class="relative size-0">
                <div class="invisible text-4xl">Moon</div>
                <div
                    class="absolute text-xl text-yellow-500"
                    :style="{
                        right: `${tabPositions.moon?.[0] ?? 0}rem`,
                        top: `${tabPositions.moon?.[1] ?? 0}rem`,
                    }"
                >
                    <div class="moon" />
                </div>
                <div
                    v-for="(starOffset, idx) in tabPositions.stars ?? []"
                    :key="`${starOffset[0]}${starOffset[1]}${idx}`"
                    :style="{
                        right: `${starOffset[0] ?? 0}rem`,
                        top: `${starOffset[1] ?? 0}rem`,
                    }"
                    class="absolute text-yellow-500"
                    :class="`text-${starOffset[2] ?? 'md'}`"
                >
                    ✦
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.moon {
    position: relative;
    transform: translate(-50%, -33%);
    width: 4em;
    height: 4em;
    border-radius: 50%;
    box-shadow: 1em 0.66em 0 0 #fff77e;
}
</style>
