import { getScale } from '@/lib/helpers/screen.helper';
import { useGameContext } from '@/state/useGameContext';
import { Actor, Camera, vec, Vector } from 'excalibur';
import { Ref, ref } from 'vue';

export type MenuAnchor = {
    anchor: {
        pos: Ref<{ x: number; y: number }>;
    };
    changeTarget: (actor: Actor) => void;
};

export function getMenuPosition(pos: Vector, offset?: Vector) {
    return useGameContext()
        .game.value.worldToScreenCoordinates(pos)
        .scale(getScale())
        .add(offset ?? vec(0, 0));
}

export function getActorAnchor(
    actor: Actor | Camera,
    opts: {
        offset?: Vector;
    } = {},
): MenuAnchor {
    const target = ref<Actor | Camera>(actor);

    const anchor = {
        pos: ref(getMenuPosition(actor.pos, opts.offset)),
    };

    return {
        anchor,
        changeTarget: (actor: Actor) => {
            target.value = actor;
        },
    };
}
