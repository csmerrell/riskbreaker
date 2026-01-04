import { makeState } from './Observable';
import { tempStaticEnemyWave } from './temp/enemyWave';
import { UnitDefinition } from '@/db/units/BattleUnit';
import { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';
import { getSourceMap, injectSources } from '@/lib/helpers/resource.helper';
import { Loadable } from 'excalibur';
import { useDb } from './useDb';
import { AssembledBattleUnit, SpriteSheetSourcedUnitDefinition } from './useBattleParty';
import { UnitState } from './saveState';
import { useActionBus } from './useActionBus';
import { useGameContext } from './useGameContext';
import { BattleScene } from '@/game/scenes/battle.scene';
import { useBattlefield } from './useBattlefield';
import { SpeedComponent } from '@/game/actors/StrategemActor/components/SpeedComponent';

const currentWave = makeState<AssembledBattleUnit[]>([]);
const wavesDefeated = makeState<number>(0);

export function assembleEnemyWave() {
    const toSet: AssembledBattleUnit[] = [];
    const { roster, battleParty } = tempStaticEnemyWave;
    battleParty.map(async (e) => {
        const { dbResource } = useDb();
        const unitDef = dbResource[roster[e.id].unitPath] as UnitDefinition;
        const sourceMap = getSourceMap(unitDef);
        const mappedUnitDef = injectSources(unitDef, sourceMap) as SpriteSheetSourcedUnitDefinition;
        const unitState = new UnitState(roster[e.id]);
        const result: AssembledBattleUnit = {
            ...e,
            actor: new StrategemActor(unitState.unitName, mappedUnitDef, unitState, 'enemy'),
            sourceMap,
            alignment: 'enemy',
        };

        toSet.push(result);
        return;
    });
    currentWave.set(toSet);
    return;
}

export function getDependencies() {
    assembleEnemyWave();
    const sources = currentWave.value.reduce(
        (acc: Loadable<unknown>[], enemy) => [
            ...acc,
            ...Object.values(enemy.sourceMap),
            ...Object.values(enemy.actor.state.strategems.getSourceMap()),
        ],
        [],
    );
    return Array.from(new Set(sources));
}

async function onActorDeath() {
    if (!currentWave.value.some((u) => !u.actor.isDead())) {
        clearWave();
    }
}

async function clearWave() {
    wavesDefeated.set(wavesDefeated.value + 1);
    const { clearQueue } = useActionBus();
    const { setLogicClock } = useGameContext();
    setLogicClock('off');
    currentWave.value.forEach((u) => {
        u.actor.kill();
    });
    clearQueue();
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            assembleEnemyWave();
            const { game } = useGameContext();
            const { enemyTiles, addActorsToField, initATB, repositionActors } = useBattlefield();
            addActorsToField(enemyWave.currentWave.value, enemyTiles.value);
            repositionActors(enemyWave.currentWave.value);
            initATB('enemy');
            enemyWave.currentWave.value.forEach((u) => {
                game.value.currentScene.add(u.actor);
            });
            Promise.all(
                currentWave.value.map((u) => {
                    return u.actor.initialized.once(() => {});
                }),
            ).then(() => {
                resolve();
                setLogicClock('on');
            });
        }, 1000);
    });
}

const waveResetListeners: (() => void)[] = [];

const enemyWave = {
    currentWave,
    waveResetListeners,
    wavesDefeated,
    getDependencies,
    onActorDeath,
};

export type EnemyWaveState = typeof enemyWave;

export function useEnemyWave() {
    return enemyWave;
}
