import { Component } from 'vue';
import { Actor, EasingFunctions, vec } from 'excalibur';

import { useExploration } from '@/state/useExploration';
import { useParty } from '@/state/useParty';
import { useBattle } from '@/state/battle/useBattle';
import { useGameContext } from '@/state/useGameContext';
import { getActorAnchor } from '@/state/ui/useActorAnchors';
import {
    addMenu,
    MENU_TRANSITION_DURATION,
    removeMenu,
    type AnchoredMenu,
} from '@/state/ui/useMenuRegistry';
import {
    captureControls,
    registerInputListener,
    unCaptureControls,
    unregisterInputListener,
} from '@/game/input/useInput';

import { maps } from '@/resource/maps';

import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { Dragon } from '@/game/actors/Monsters/Dragon.actor';
import { KeyedAnimationActor } from '@/game/actors/KeyedAnimationActor';
import { LightSource } from '@/game/actors/LightSource/LightSource.component';

import TargetIndicator from '@/ui/components/menus/TargetIndicator.vue';
import PlayerOriginBox from '@/ui/components/menus/unique/originSelect/PlayerOriginBox.vue';
import PlayerOriginHeader from '@/ui/components/menus/unique/originSelect/PlayerOriginHeader.vue';

import { nanoid } from 'nanoid';
import { getScale } from '@/lib/helpers/screen.helper';

import type { GameScript } from '../../types/GameScript';

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
                scale: getScale(),
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

export const focusOriginCharacter = async () => {
    const explorationManager = useExploration().getExplorationManager();
    await explorationManager.ready();
    const camera = explorationManager.scene.camera;
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
        moveCameraToActor(explorationManager.campManager.getActors()[0], {
            movementDuration: 750,
        }),
        camera.zoomOverTime(1 + 2 / getScale(), 750, EasingFunctions.Linear),
    ]);
};

function onP0Focus(player: Actor) {
    return displayPlayerOrigin('riskbreaker', player, 'left');
}
function onP1Focus(player: Actor) {
    return displayPlayerOrigin('astrologian', player, 'right');
}

export const addOriginCharacterControls = async (
    onP0Focus: (player: Actor) => AnchoredMenu[],
    onP1Focus: (player: Actor) => AnchoredMenu[],
    headerComponent?: Component,
) => {
    //Await player origin select
    await new Promise<void>((resolve) => {
        const explorationManager = useExploration().getExplorationManager();
        const campMgr = explorationManager.campManager;
        const [p0, p1] = campMgr.getActors();
        let menus: AnchoredMenu[] = [];
        function clearMenus() {
            while (menus.length > 0) {
                const menu = menus.pop()!;
                removeMenu(menu.id);
            }
        }

        let focusedPlayer: 'p0' | 'p1' = 'p0';
        menus = onP0Focus(p0);
        let header: Component;
        if (headerComponent) {
            header = addMenu(headerComponent, {});
        }

        captureControls('OriginSelect');
        let moving = false;
        const listeners: string[] = [];
        listeners.push(
            registerInputListener(() => {
                if (moving || focusedPlayer === 'p1') return;
                focusedPlayer = 'p1';
                moving = true;

                clearMenus();
                moveCameraToActor(p1, { xOffset: 24 }).then(() => {
                    menus = onP1Focus(p1);
                    moving = false;
                });
            }, ['menu_left', 'movement_left']),
        );

        listeners.push(
            registerInputListener(() => {
                if (moving || focusedPlayer === 'p0') return;
                focusedPlayer = 'p0';
                moving = true;

                clearMenus();
                moveCameraToActor(p0).then(() => {
                    menus = onP0Focus(p0);
                    moving = false;
                });
            }, ['menu_right', 'movement_right']),
        );

        listeners.push(
            registerInputListener(() => {
                while (menus.length > 0) {
                    const menu = menus.pop()!;
                    removeMenu(menu.id);
                }
                if (header) {
                    document.getElementById('main-container')!.removeChild(header as Element);
                }
                listeners.forEach((l) => unregisterInputListener(l));
                unCaptureControls();
                resolve();
            }, 'confirm'),
        );
    });
};

export const newGameOriginSelect: GameScript = {
    events: [
        focusOriginCharacter,
        async () => {
            return addOriginCharacterControls(onP0Focus, onP1Focus, PlayerOriginHeader);
        },
        async () => {
            const explorationMgr = useExploration().getExplorationManager();
            await explorationMgr.ready();

            //add leader to exploration screen
            const leader = useParty().getLeader();
            const { mainHand, offHand, ...leaderAppearance } = leader.appearance;
            const actor = new CompositeActor({ ...leader, appearance: leaderAppearance });
            actor.unitId = leader.id;
            actor.addComponent(new LightSource({ radius: 1 }));

            const actorMgr = explorationMgr.actorManager;
            actorMgr.clearPlayers();
            actorMgr.addPlayer(actor);

            const mapMgr = explorationMgr.mapManager;
            await mapMgr.placePlayerAtTile(maps.westDarklands.startPos);

            //close camp
            await explorationMgr.campManager.closeCamp();

            //load exploration UI
            useGameContext().activeView.value = 'exploration';

            //enable movement
            explorationMgr.movementManager.enableMovement();

            registerInputListener(async () => {
                const { addEnemy, clearEnemies } = useBattle();
                await explorationMgr.safeHaltMovement();
                clearEnemies();
                addEnemy({
                    id: nanoid(16),
                    name: 'Dragon',
                    constructor: Dragon as typeof KeyedAnimationActor,
                    config: {
                        battlePosition: 'right-1',
                    },
                    stats: Dragon.stats,
                });
                explorationMgr.battleManager.openBattle();
            }, 'context_menu_2');
        },
    ],
};
