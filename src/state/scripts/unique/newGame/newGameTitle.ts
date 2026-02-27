import { useGameContext } from '@/state/useGameContext';
import { GameScript } from '../../types/GameScript';
import { useExploration } from '@/state/useExploration';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { LightSource } from '@/game/actors/LightSource/LightSource.component';
import { EasingFunctions, vec } from 'excalibur';

export const newGameTitle: GameScript = {
    events: [
        async () => {
            const game = useGameContext().game.value;
            const { getExplorationManager } = useExploration();
            await game.goToScene('exploration');
            const explorationManager = getExplorationManager();
            await explorationManager.ready();
            const player = new CompositeActor({
                hair: 'shortMessy',
                armor: 'riskbreakerLeathers',
            });
            player.addComponent(new LightSource({ radius: 2 }));

            const player2 = new CompositeActor({
                hair: 'dragonBob',
                armor: 'stonecallerRobe',
            });
            await explorationManager.actorManager.addPlayer(player);
            await explorationManager.actorManager.addPlayer(player2);
            explorationManager.cameraManager.setPrimaryTarget(player);
            await explorationManager.awaitCameraSettle();
            await explorationManager.mapManager.loadMap('westDarklands');
            await explorationManager.mapManager.placePlayerAtTile(
                explorationManager.mapManager.currentMap.value.startPos,
            );
            await explorationManager.awaitCameraSettle();
            explorationManager.cameraManager.unlock();
            await explorationManager.campManager.openCamp();
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    const canvas = document.getElementById('main-canvas')!;
                    const onAnimationEnd = () => {
                        setTimeout(() => {
                            canvas.removeEventListener('transitionend', onAnimationEnd);
                            resolve();
                        }, 500);
                    };
                    canvas.addEventListener('transitionend', () => onAnimationEnd());
                    canvas.classList.remove('hide');
                }, 1000);
            });
            const camera = explorationManager.scene.camera;
            await Promise.all([
                camera.move(camera.pos.add(vec(16, -8)), 1500, EasingFunctions.EaseInQuad),
                camera.zoomOverTime(1.25, 1500, EasingFunctions.EaseInQuad),
            ]);
        },
    ],
};
