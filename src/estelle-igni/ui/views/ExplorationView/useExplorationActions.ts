import { HotbarActionComponent } from '@/game/actions/HotbarAction.component';
import { resources } from '@/resource';
import { useExploration } from '@/state/useExploration';
import { useGameContext } from '@/state/useGameContext';
import { QuadEvents } from '@/ui/components/menus/crossHotbar/HotbarQuad.vue';
import { Entity, vec, type Vector } from 'excalibur';
import { ref } from 'vue';

export type ExplorationActionMetadata = {
    iconPos: Vector;
    action: () => Promise<unknown>;
    label?: string;
};
export function useExplorationActions() {
    const ready = ref(false);

    const dynamicActions = ref<QuadEvents>({});
    function bindActions() {
        const upAction = new Entity();
        upAction.addComponent(
            new HotbarActionComponent({
                iconPos: vec(1, 0),
                label: 'Floating Lantern',
                action: async () => {
                    useExploration().getExplorationManager().lanternManager.prepLantern();
                },
            }),
        );
        const rightAction = new Entity();
        rightAction.addComponent(
            new HotbarActionComponent({
                iconPos: vec(2, 0),
                label: 'Grappling Hook',
                action: async () => {
                    console.log('GRAPPLING HOOK');
                },
            }),
        );

        const downAction = new Entity();
        downAction.addComponent(
            new HotbarActionComponent({
                iconPos: vec(3, 0),
                label: 'Plane Shift',
                action: async () => {
                    console.log('PLANE SHIFT');
                },
            }),
        );

        dynamicActions.value = {
            up: upAction,
            right: rightAction,
            down: downAction,
        };
    }

    if (!resources.image.icons.menu.isLoaded()) {
        resources.image.icons.menu.load().then(() => {
            bindActions();
            ready.value = true;
        });
    } else {
        bindActions();
        ready.value = true;
    }

    const setDynamicAction = (
        pos: keyof typeof dynamicActions.value,
        actionEntity: null | Entity,
    ) => {
        if (!actionEntity) {
            const newActions = dynamicActions.value;
            delete newActions[pos];

            dynamicActions.value = newActions;
        } else {
            dynamicActions.value[pos] = actionEntity;
        }
    };

    return {
        ready,
        dynamicActions,
        setDynamicAction,
    };
}
