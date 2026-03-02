import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';
import { makeState } from './Observable';
import { LaneKey } from './useParty';

export type EnemyDef = {
    id: string;
    name: string;
    constructor: typeof KeyedAnimationActor;
    config: {
        battlePosition: LaneKey;
    };
};

export type BattleState = {
    enemies: EnemyDef[];
};

const battleState = makeState<BattleState>({
    enemies: [],
});

function addEnemy(enemy: EnemyDef) {
    battleState.set({
        ...battleState.value,
        enemies: battleState.value.enemies.concat([enemy]),
    });
}

function removeEnemy(id: string) {
    const idx = battleState.value.enemies.findIndex((e) => e.id === id);
    if (idx < 0) return;

    battleState.set({
        ...battleState.value,
        enemies: battleState.value.enemies
            .slice(0, idx)
            .concat(battleState.value.enemies.slice(idx + 1)),
    });
}

function clearEnemies() {
    battleState.set({
        ...battleState.value,
        enemies: [],
    });
}

export function useBattle() {
    return {
        battleState,
        addEnemy,
        removeEnemy,
        clearEnemies,
    };
}
