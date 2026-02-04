import { useGameContext } from '@/state/useGameContext';
import { GameScript } from '../types/GameScript';
import { useExploration } from '@/state/useExploration';
import { vec } from 'excalibur';

export const newGameTitle: GameScript = {
    events: [
        async () => {
            const game = useGameContext().game.value;
            const { setCurrentMap, getExplorationManager } = useExploration();
            setCurrentMap('intro');
            game.goToScene('exploration');
            const explorationManager = getExplorationManager();
            await explorationManager.ready();
            explorationManager.scene.camera.move(
                explorationManager.player.pos.add(vec(36, -20)),
                0,
            );
        },
    ],
};
