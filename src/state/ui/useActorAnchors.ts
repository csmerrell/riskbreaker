import { getScale } from '@/lib/helpers/screen.helper';
import { useGameContext } from '@/state/useGameContext';
import { Actor, Camera, vec, Vector } from 'excalibur';
import { computed, Ref, ref } from 'vue';

export type MenuAnchor = {
    anchor: {
        pos: Ref<{ x: number; y: number }>;
    };
    changeTarget: (actor: Actor) => void;
    cleanup: () => void;
};

export function getActorAnchor(
    actor: Actor | Camera,
    opts: {
        offset?: Vector;
    } = {},
): MenuAnchor {
    const target = ref<Actor | Camera>(actor);
    const pos = ref<{ x: number; y: number }>(target.value.pos);

    const interval = setInterval(() => {
        const { x, y } = pos.value;
        if (target.value.pos.sub(vec(x, y)).magnitude === 0) {
            return;
        }

        pos.value = target.value.pos;
    }, 50);

    const anchor = {
        pos: computed<{ x: number; y: number }>(() => {
            const { x, y } = pos.value;
            return useGameContext()
                .game.value.worldToScreenCoordinates(vec(x, y))
                .scale(getScale())
                .add(opts.offset ?? vec(0, 0));
        }),
    };

    return {
        anchor,
        changeTarget: (actor: Actor) => {
            target.value = actor;
        },
        cleanup: () => {
            clearInterval(interval);
        },
    };
}
