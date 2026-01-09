<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';

import IntentCard from './IntentCard.vue';
import MenuBox from '@/ui/components/MenuBox.vue';
import ClockModeReadout from './ClockModeReadout.vue';
import CrossHotbar from './crossHotbar/CrossHotbar.vue';
import BattleLog from './BattleLog.vue';

import { useGameContext } from '@/state/useGameContext';
import { useBattleParty } from '@/state/deprecated/useBattleParty';
import { useEnemyWave } from '@/state/deprecated/useEnemyWave';
import { useBattlefield } from '@/state/deprecated/useBattlefield';

import type { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
import { useClock } from '@/state/deprecated/useClock';
import { useControlState } from '@/state/menus/useControlState';
import { InspectUnitState } from './controlStates/InspectUnit';

const { adjustTileFields, initFields: initTileFields, initATB } = useBattlefield();

const { pushControlState } = useControlState();
const inspectUnitState = new InspectUnitState();
pushControlState(inspectUnitState);

const { party: partyUnits } = useBattleParty();
const { currentWave } = useEnemyWave();

const party = ref<StrategemActor[]>([]);
partyUnits.subscribe(() => {
    party.value = partyUnits.value.map((p) => p.actor);
});

const enemies = ref<StrategemActor[]>([]);
currentWave.subscribe(() => {
    enemies.value = currentWave.value.map((e) => e.actor);
});

const { game } = useGameContext();
const sceneLoaded = ref(false);
const fieldLoaded = ref(false);
game.value.goToScene('battle').then(async () => {
    sceneLoaded.value = true;
    party.value = partyUnits.value.map((p) => p.actor);
    enemies.value = currentWave.value.map((e) => e.actor);

    nextTick().then(() => {
        initTileFields();
        adjustTileFields();
        fieldLoaded.value = true;

        initATB();

        const { resumeClock } = useClock();
        resumeClock();
    });
});

window.addEventListener('resize', () => adjustTileFields);
onBeforeUnmount(() => {
    window.removeEventListener('resize', adjustTileFields);
});
</script>

<template>
    <div class="flex size-full flex-col">
        <div class="-my-1 flex h-[54px] flex-row justify-end bg-bg" menu-row>
            <div class="relative grow">
                <ClockModeReadout />
                <div class="absolute inset-x-1 border-b border-yellow-700">
                    <img src="/image/tile/MenuAccent.png" class="absolute bottom-[-6px] right-0" />
                </div>
            </div>
            <template v-if="fieldLoaded">
                <Transition
                    v-for="(enemy, idx) in enemies.filter((e) => !e.isDead())"
                    :key="`${idx}-${enemy.id}`"
                    name="fade"
                >
                    <IntentCard :unit="enemy" :idx class="mr-1" />
                </Transition>
                <IntentCard />
            </template>
        </div>

        <MenuBox no-border :poles="{ SE: true, NW: true }" class="relative m-1 h-[55%]">
            <div
                class="absolute inset-0 z-0 flex size-full flex-row items-end justify-between px-24"
            >
                <div id="party-box" ref="partyBox" class="mb-4">&nbsp;</div>
                <div id="enemy-box" ref="enemyBox" class="mb-4">&nbsp;</div>
            </div>
        </MenuBox>
        <div class="-my-1 grow bg-bg">
            <div class="inset-x-1 flex flex-row items-start justify-start pl-1 pr-3" menu-row>
                <template v-if="fieldLoaded">
                    <IntentCard
                        v-for="(member, idx) in party"
                        :key="member.id"
                        :unit="member"
                        :idx
                    />
                </template>
                <div class="relative inset-x-1 grow border-b border-yellow-700">
                    <img src="/image/tile/MenuAccent.png" class="absolute -top-1 -scale-100" />
                </div>
            </div>
            <div class="flex grow flex-row">
                <CrossHotbar />
                <BattleLog />
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.5s ease,
        width 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    width: 0;
}
</style>
