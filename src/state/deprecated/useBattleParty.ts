import { BattleMember } from './types/BattleMember';
import { makeState } from '../Observable';
import { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
import { UnitDefinition } from '@/db/units/BattleUnit';
import { getSourceMap, injectSources } from '@/lib/helpers/resource.helper';
import { SourceMappedSpriteSheet } from '@/db/types';
import { Loadable, Resource } from 'excalibur';
import { usePlayerRoster } from './useRoster';
import { SaveState, UnitBattlePartySaveState } from './saveState';
import { useEnemyWave } from './useEnemyWave';
import { computed, ref } from 'vue';
import { useCrossHotbar } from '@/ui/views/deprecated/BattleScreen/state/useCrossHotbar';

export type AssembledBattleUnit = UnitBattlePartySaveState & {
    actor: StrategemActor;
    sourceMap: Record<string, Resource<unknown>>;
    alignment: 'party' | 'enemy';
};
export type SpriteSheetSourcedUnitDefinition = UnitDefinition & {
    spriteSheet: SourceMappedSpriteSheet;
};
const partySummary = makeState<UnitBattlePartySaveState[]>();
const party = makeState<AssembledBattleUnit[]>([]);

export function initBattleParty(saveState: SaveState) {
    partySummary.set(saveState.battleParty);
}

function assembleParty() {
    const { roster } = usePlayerRoster();

    const toSet: AssembledBattleUnit[] = [];
    partySummary.value.forEach((p) => {
        const { unitDef, unitName } = roster.value[p.id];
        const sourceMap = getSourceMap(unitDef);
        const mappedUnitDef = injectSources(unitDef, sourceMap) as SpriteSheetSourcedUnitDefinition;
        const result: AssembledBattleUnit = {
            ...p,
            actor: new StrategemActor(unitName, mappedUnitDef, roster.value[p.id], 'party'),
            sourceMap,
            alignment: 'party',
        };
        toSet.push(result);
    });
    party.set(toSet);
}

const actionableActor = ref<StrategemActor | null>(null);
const activeActor = computed({
    get: () => actionableActor.value,
    set: (val: StrategemActor | undefined) => {
        if (val !== undefined) {
            const { currentHotbar } = useCrossHotbar();
            currentHotbar.value = val.getHotbar();
        }
        actionableActor.value = val;
    },
});

const lockMenuToActiveActor = ref<boolean>(false);

export function getDependencies() {
    assembleParty();
    const sources = party.value.reduce(
        (acc: Loadable<unknown>[], partyMember) => [
            ...acc,
            ...Object.values(partyMember.sourceMap),
            ...Object.values(partyMember.actor.state.strategems.getSourceMap()),
        ],
        [],
    );
    return Array.from(new Set(sources));
}

function onActorDeath() {
    if (!party.value.some((u) => !u.actor.isDead())) {
        const { wavesDefeated } = useEnemyWave();
        console.log('GAME OVER');
        console.log(`Waves defeated: ${wavesDefeated.value}`);
    }
}

const battleParty = {
    activeActor,
    lockMenuToActiveActor,
    party,
    getDependencies,
    initBattleParty,
    onActorDeath,
};
export type BattlePartyState = typeof battleParty;

export function useBattleParty() {
    return battleParty;
}

export type BattlePartySaveState = {
    party: BattleMember<'party'>[];
};
export function exportState(): BattlePartySaveState {
    return {
        party: party.value.map((pm) => {
            const { actor, ...toSave } = pm;
            return toSave;
        }),
    };
}
