import { useExploration } from '@/state/useExploration';
import { GameScript } from '../../types/GameScript';
import { EnemyDef, useBattle } from '@/state/battle/useBattle';
import { Wolf } from '@/game/actors/Monsters/Wolf.actor';
import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';
import { nanoid } from 'nanoid';
import { LaneKey } from '@/state/useParty';

function getWolfDef(position: LaneKey, palette: 'white' | 'black'): EnemyDef {
    return {
        id: nanoid(16),
        name: 'Wolf',
        config: {
            battlePosition: position,
        },
        constructor: class extends Wolf {
            constructor() {
                super({ palette });
            }
        } as unknown as typeof KeyedAnimationActor,
        stats: Wolf.stats[palette],
    };
}
export const newGameFirstBattle: GameScript = {
    events: [
        async () => {
            console.warn(
                'TODO: Tutorial battle needs to save and check a settings flag or it will execute more than once.',
            );
        },
        async () => {
            const explorationMgr = useExploration().getExplorationManager();
            await explorationMgr.awaitCameraSettle();
            const battleMgr = explorationMgr.battleManager;
            const { addEnemy, clearEnemies } = useBattle();
            clearEnemies();
            addEnemy(getWolfDef('mid', 'black'));
            addEnemy(getWolfDef('right-1', 'black'));
            battleMgr.openBattle();
        },
    ],
};
