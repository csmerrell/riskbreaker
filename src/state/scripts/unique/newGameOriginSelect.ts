import { GameScript } from '../types/GameScript';
import { useExploration } from '@/state/useExploration';
import { Actor, EasingFunctions, vec } from 'excalibur';
import { getActorAnchor, MenuAnchor } from '@/state/ui/useActorAnchors';
import {
    addMenu,
    MENU_TRANSITION_DURATION,
    MenuInstance,
    removeMenu,
} from '@/state/ui/useMenuRegistry';
import TargetIndicator from '@/ui/components/menus/TargetIndicator.vue';
import { captureControls, registerInputListener } from '@/game/input/useInput';
import PlayerOriginBox from '@/ui/components/menus/unique/PlayerOriginBox.vue';
import { getScale } from '@/lib/helpers/screen.helper';
import { html } from 'lit-html';

type AnchoredMenu = MenuInstance & { anchor: MenuAnchor };
function displayPlayerOrigin(
    origin: 'riskbreaker' | 'astrologian',
    actor: Actor,
    xAnchor: 'left' | 'right',
) {
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
                scale: 4,
            },
        }),
    });

    const menuAnchor = getActorAnchor(actor, {
        offset: vec(60 * (xAnchor === 'right' ? -1 : 1), 12 * getScale()),
    });
    menus.push({
        anchor: menuAnchor,
        ...addMenu(PlayerOriginBox, {
            position: menuAnchor.anchor.pos,
            xAnchor,
            yAnchor: 'bottom',
            props: {
                origin,
            },
        }),
    });

    return menus;
}
function moveCameraToActor(
    actor: Actor,
    options: {
        movementDuration?: number;
        xOffset?: number;
    } = {},
) {
    const camera = useExploration().getExplorationManager().scene.camera;

    return camera.move(
        vec(actor.pos.x - 12 + (options.xOffset ?? 0), actor.pos.y - 24),
        options.movementDuration ?? MENU_TRANSITION_DURATION,
        EasingFunctions.Linear,
    );
}

export const newGameOriginSelect: GameScript = {
    events: [
        async () => {
            //zoom in on p0
            const explorationManager = useExploration().getExplorationManager();
            await explorationManager.ready();
            const camera = explorationManager.scene.camera;
            const actorMgr = explorationManager.actorManager;
            const p0 = actorMgr.getPlayers()[0];
            await Promise.all([
                new Promise<void>((resolve) => {
                    const menuEl = document.getElementById('title-menu')!;
                    menuEl.style.setProperty('transition-duration', '250ms');
                    menuEl.classList.add('hide');
                    const hideListener = () => {
                        menuEl.removeEventListener('transitionend', hideListener);
                        resolve();
                    };
                    menuEl.addEventListener('transitionend', hideListener);
                }),
                moveCameraToActor(p0, { movementDuration: 750 }),
                camera.zoomOverTime(1.5, 750, EasingFunctions.Linear),
            ]);
        },
        async () => {
            //Await player origin select
            await new Promise((resolve) => {
                const explorationManager = useExploration().getExplorationManager();
                const actorMgr = explorationManager.actorManager;
                const [p0, p1] = actorMgr.getPlayers();
                let menus: AnchoredMenu[] = [];
                function clearMenus() {
                    while (menus.length > 0) {
                        const menu = menus.pop()!;
                        removeMenu(menu.id);
                        menu.anchor.cleanup();
                    }
                }

                let focusedPlayer: 'p0' | 'p1' = 'p0';
                menus = displayPlayerOrigin('riskbreaker', p0, 'left');
                const header = document.createElement('span');
                header.classList.add('fixed', 'z-[9999]', 'w-full', 'py-24');
                header.innerHTML = html`<div
                    class="flex flex-col justify-center items-center gap-2 text-amber-200 stroke-black stroke-1"
                >
                    <div class="text-standard-lg stroke-2 stroke-black">
                        Select your party lead.
                    </div>
                    <div class="text-standard-sm">(This can be changed freely)</div>
                </div>`.strings[0];
                document.getElementById('main-container')!.appendChild(header);

                captureControls();
                let moving = false;
                registerInputListener(() => {
                    if (moving || focusedPlayer === 'p1') return;
                    focusedPlayer = 'p1';
                    moving = true;

                    clearMenus();
                    moveCameraToActor(p1, { xOffset: 24 }).then(() => {
                        menus = displayPlayerOrigin('astrologian', p1, 'right');
                        moving = false;
                    });
                }, ['menu_left', 'movement_left']);

                registerInputListener(() => {
                    if (moving || focusedPlayer === 'p0') return;
                    focusedPlayer = 'p0';
                    moving = true;

                    clearMenus();
                    moveCameraToActor(p0).then(() => {
                        menus = displayPlayerOrigin('riskbreaker', p0, 'left');
                        moving = false;
                    });
                }, ['menu_right', 'movement_right']);
            });
        },
    ],
};
