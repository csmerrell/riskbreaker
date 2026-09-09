import { Actor, vec } from 'excalibur';

import TargetIndicator from '@/ui/components/menus/TargetIndicator.vue';
import GauntletCharacterOverlay from '@/ui/components/menus/unique/gauntlet/GauntletCharacterOverlay.vue';
import GauntletStartHeader from '@/ui/components/menus/unique/gauntlet/GauntletStartHeader.vue';

import { addMenu, AnchoredMenu } from '@/state/ui/useMenuRegistry';
import { addOriginCharacterControls, focusOriginCharacter } from '../newGame/newGameOriginSelect';
import { getScale } from '@/lib/helpers/screen.helper';
import { getActorAnchor } from '@/state/ui/useActorAnchors';

import type { GameScript } from '../../types/GameScript';

function onPlayerFocus(actor: Actor) {
    const menus: AnchoredMenu[] = [];
    const arrowAnchor = getActorAnchor(actor, {
        offset: vec(0, -84),
    });
    menus.push({
        anchor: arrowAnchor,
        ...addMenu(TargetIndicator, {
            position: arrowAnchor.anchor.pos,
            props: {
                type: 'arrow',
                direction: 'down',
                blink: true,
                scale: getScale(),
            },
        }),
    });

    menus.push({
        anchor: getActorAnchor(new Actor()),
        ...addMenu(GauntletCharacterOverlay, {}),
    });

    return menus;
}
export const startGauntlet: GameScript = {
    events: [
        focusOriginCharacter,
        async () => {
            return addOriginCharacterControls(onPlayerFocus, onPlayerFocus, GauntletStartHeader);
        },
        // async () => {
        //     addMenu()
        // },
    ],
};
