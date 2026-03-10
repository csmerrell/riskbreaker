import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { EnemyDef, useBattle } from '@/state/battle/useBattle';
import { getActorAnchor } from '@/state/ui/useActorAnchors';
import { addMenu, removeMenu } from '@/state/ui/useMenuRegistry';
import { useExploration } from '@/state/useExploration';
import TargetIndicator from '@/ui/components/menus/TargetIndicator.vue';
import { vec } from 'excalibur';

export async function targetEnemy() {
    const { enemies } = useBattle().battleState.value;
    const allBattleActors = useExploration().getExplorationManager().battleManager.getAllActors();
    const enemyActors = enemies.map((e) => {
        return Object.values(allBattleActors).find((actor) => e.id === actor.unitId)!;
    });

    let selected = 0;
    const actorAnchor = getActorAnchor(enemyActors[selected], { offset: vec(0, -64) });
    const indicator = addMenu(TargetIndicator, {
        position: actorAnchor.anchor.pos,
        props: {
            type: 'arrow',
            direction: 'down',
            blink: true,
            scale: 4,
        },
    });

    await new Promise<EnemyDef>((resolve) => {
        const listeners = [
            registerInputListener(() => {
                selected = selected - 1;
                if (selected < 0) selected = enemyActors.length - 1;

                actorAnchor.changeTarget(enemyActors[selected]);
                //todo: Show additional enemy/action context
            }, ['menu_left', 'movement_left', 'movement_down', 'menu_down']),
            registerInputListener(() => {
                selected = selected + 1;
                if (selected >= enemyActors.length) selected = 0;

                actorAnchor.changeTarget(enemyActors[selected]);
                //todo: Show additional enemy/action context
            }, ['menu_right', 'movement_right', 'movement_up', 'menu_up']),
            registerInputListener(() => {
                //todo > Select target, continue action
                removeMenu(indicator.id);
                listeners.forEach((l) => unregisterInputListener(l));
            }, 'confirm'),
            registerInputListener(() => {
                removeMenu(indicator.id);
                listeners.forEach((l) => unregisterInputListener(l));
                //todo > cleanup any help text, etc.
            }, 'cancel'),
        ];
    });
}
