import { useExploration } from '@/state/useExploration';
import { useScript } from '@/state/useScript';
import { useGameContext } from '@/state/useGameContext';
import { isCompositeActor } from '@/game/actors/CompositeActor/CompositeActor';

export async function openBattle() {
    const { awaitScene } = useExploration();
    return awaitScene().then(async () => {
        const engine = useGameContext().game.value;
        engine.currentScene.actors.forEach((a) => {
            if (isCompositeActor(a)) {
                a.hide();
            }
        });
        useExploration().openBattle();
        await useScript().renderTick.value();
    });
}
