import { useExploration } from '@/state/useExploration';
import { GameScript } from '../../types/GameScript';

export const newGameFirstBattle: GameScript = {
    events: [
        async () => {
            console.warn(
                'TODO: Tutorial battle needs to save and check a settings flag or it will execute more than once.',
            );
        },
        async () => {
            const explorationMgr = useExploration().getExplorationManager();
            const battleMgr = explorationMgr.battleManager;
            battleMgr.openBattle();
        },
    ],
};
