<script setup lang="ts">
import { PartyMenuTab, useExploration } from '@/state/useExploration';
import { computed, ref } from 'vue';
import { useNightSky } from './useNightSky';
import { PartyMember, PartyState, useParty } from '@/state/useParty';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { vec } from 'excalibur';
import { getScale } from '@/lib/helpers/screen.helper';
import { useGameContext } from '@/state/useGameContext';

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

const { partyState } = useParty();
const party = ref(partyState.value.party);
const partySilhouettes = ref<string[]>([]);
const updateSilhouettes = async (val: PartyState | undefined) => {
    const headshotManager =
        useExploration().getExplorationManager().partyMenuManager.headshotManager;
    if (!val) {
        headshotManager.clearHeadshots();
    }
    const silhouettes: string[] = [];
    const promise = new Promise<void>(async (resolve) => {
        for (let i = 0; i < val!.party.length; i++) {
            const member = val!.party[i];
            const actor = new CompositeActor(member);
            actor.scale = vec(-1, 1);
            silhouettes.push(
                await headshotManager.captureTemporalSnapshot(actor, {
                    scale: vec(-1 / getScale() + -1 / getScale(), 1 / getScale() + 1 / getScale()),
                    animation:
                        i === 0
                            ? 'static'
                            : i === 1
                              ? 'sitRest'
                              : Math.random() > 0.5
                                ? 'static'
                                : 'sitRest',
                    isSilhouette: true,
                }),
            );
            if (i >= val!.party.length - 1) {
                resolve();
            }
        }
    });
    await promise;
    partySilhouettes.value = silhouettes;
};
updateSilhouettes(partyState.value);
partyState.subscribe((val) => {
    party.value = val?.party ?? [];
    updateSilhouettes(val);
});
</script>

<template>
    <div v-show="show" class="fixed right-0 top-0 z-[1000]">
        <div class="absolute z-[1]" :style="anchorStyles">
            <img
                src="/image/misc/SkyBlotch.svg"
                class="relative -right-16 -top-4 w-96 -scale-y-100 opacity-80"
            />
            <img
                src="/image/misc/GroundBlotch.svg"
                class="relative -bottom-4 -right-24 w-96 opacity-90"
            />
            <img
                v-for="(silhouette, idx) in partySilhouettes"
                :key="silhouette"
                :src="silhouette"
                class="absolute bottom-0.5 left-1/2 -translate-x-4"
                :style="{ paddingLeft: `${idx * 2.5}rem` }"
            />
        </div>
        <div class="absolute z-[2]" :style="anchorStyles">
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
