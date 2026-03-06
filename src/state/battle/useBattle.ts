import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';
import { makeState } from '../Observable';
import { LaneKey } from '../useParty';
import { UnitStats } from './UnitStats';

export type EnemyDef = {
    id: string;
    alignment: 'enemy';
    name: string;
    constructor: typeof KeyedAnimationActor;
    config: {
        battlePosition: LaneKey;
    };
    stats: UnitStats;
};

export type BattleState = {
    enemies: EnemyDef[];
};

const battleState = makeState<BattleState>({
    enemies: [],
});

function addEnemy(enemy: Omit<EnemyDef, 'alignment'> & { alignment?: 'enemy' }) {
    enemy.alignment = 'enemy';
    battleState.set({
        ...battleState.value,
        enemies: battleState.value.enemies.concat([enemy as EnemyDef]),
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
