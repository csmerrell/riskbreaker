import { useGameContext } from '@/state/useGameContext';
import { GameScript } from '../../types/GameScript';
import { useExploration } from '@/state/useExploration';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { LightSource } from '@/game/actors/LightSource/LightSource.component';
import { EasingFunctions, vec } from 'excalibur';
import { useParty } from '@/state/useParty';
import { captureControls } from '@/game/input/useInput';

export const newGameTitle: GameScript = {
    events: [
        async () => {
            //mount exploration manager
            const game = useGameContext().game.value;
            const { getExplorationManager } = useExploration();
            await game.goToScene('exploration');
            const explorationManager = getExplorationManager();
            await explorationManager.ready();

            //load saved party
            const { getLeader, loadParty } = useParty();
            await loadParty();

            //add default leader to exploration screen, so camera can position
            const leader = new CompositeActor(getLeader().appearance);
            leader.addComponent(new LightSource({ radius: 1 }));
            await explorationManager.actorManager.addPlayer(leader);

            //load map, position camera
            await explorationManager.mapManager.loadMap('westDarklands');
            await explorationManager.mapManager.placePlayerAtTile(
                explorationManager.mapManager.currentMap.value.startPos,
            );
            explorationManager.cameraManager.setPrimaryTarget(leader);
            await explorationManager.awaitCameraSettle();

            //prep camp, then reveal canvas
            await explorationManager.campManager.openCamp();
            //control capture has to happen after camp open, or camp will steal controls from title menu
            captureControls('Title');
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

            //zoom out, pan camera for title reveal
            explorationManager.cameraManager.unlock();
            const camera = explorationManager.scene.camera;
            await Promise.all([
                camera.move(camera.pos.add(vec(16, -8)), 1500, EasingFunctions.EaseInQuad),
                camera.zoomOverTime(1.25, 1500, EasingFunctions.EaseInQuad),
            ]);
        },
    ],
};
