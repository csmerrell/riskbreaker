import { Actor, Animation, AnimationStrategy, Scene, SpriteSheet, vec } from 'excalibur';
import { resources } from '@/resource';

import type { MapMeta } from '@/resource/maps/maps';
import { registerInputListener, unregisterInputListener } from '@/game/input/useInput';
import { TileControlPrompt, useExploration } from '../useExploration';
import { getTileCenter, getTileCenter_Raw } from '@/resource/maps';

export type BonfireState = {
    intensityScale: number;
    health: number;
};

export class BonfireManager {
    private bonfires: Record<string, BonfireState & { actor?: Actor }> = {};
    private scene: Scene;
    private spriteSheet: SpriteSheet;
    private ready: Promise<void | HTMLElement>;

    constructor(opts: { scene: Scene }) {
        this.scene = opts.scene;
        if (!resources.image.misc.bonfire.isLoaded()) {
            this.ready = resources.image.misc.bonfire.load();
        } else {
            this.ready = Promise.resolve();
        }
        this.ready.then(() => {
            this.spriteSheet = SpriteSheet.fromImageSource({
                image: resources.image.misc.bonfire,
                grid: {
                    spriteHeight: 24,
                    spriteWidth: 24,
                    rows: 1,
                    columns: 7,
                },
            });
        });
    }

    private generateBonfire() {
        const actor = new Actor();
        actor.graphics.add(
            'main',
            Animation.fromSpriteSheet(
                this.spriteSheet,
                [1, 2, 3, 4, 5, 6],
                200,
                AnimationStrategy.Loop,
            ),
        );
        return actor;
    }

    public loadBonfires(mapMeta: MapMeta, saveState?: Record<string, BonfireState>) {
        this.bonfires =
            saveState ??
            Object.entries(mapMeta.keyPoints)
                .filter(([_key, kp]) => kp.type === 'bonfire')
                .reduce((acc, [key, _val]) => {
                    return {
                        ...acc,
                        [key]: {
                            intensityScale: 0,
                            health: 0,
                        },
                    };
                }, {});

        this.ready.then(() => {
            Object.entries(this.bonfires).forEach(([key, fire]) => {
                if (fire.health > 0) {
                    this.placeBonfire(key);
                }
            });
        });
    }

    private placeBonfire(key: string) {
        const fire = this.bonfires[key];

        fire.actor = this.generateBonfire();
        fire.actor.pos = getTileCenter_Raw(key);
        console.log(fire.actor.pos);
        fire.actor.anchor = vec(0, 0);
        fire.actor.z = 1;
        fire.actor.graphics.use('main');
        this.scene.add(fire.actor);
        this.scene.on('moved', () => {
            fire.health = Math.max(0, fire.health - 1);
            if (fire.health === 0) {
                fire.actor.kill();
            }
        });
    }

    public getBonfires() {
        return this.bonfires;
    }

    public getTileOffsets() {
        return {
            offset: vec(-8, -8),
            playerScale: vec(-1, 1),
        };
    }

    public tickBonfires() {
        Object.values(this.bonfires).map((fire) => ({
            ...fire,
            health: fire.health - 1,
        }));
    }

    public ignite(
        key: string,
        opts?: {
            intensityScale?: number;
            health?: number;
        },
    ) {
        this.ready.then(() => {
            const { intensityScale = 0.05, health = 100 } = opts ?? {};
            this.bonfires[key] = {
                intensityScale,
                health,
            };
            this.placeBonfire(key);
            this.setTilePrompts(key);
        });
    }

    private getDefaultPrompts(key: string): TileControlPrompt['commands'] {
        return [
            {
                command: 'confirm',
                label: this.bonfires[key].health > 0 ? 'Refuel' : 'Ignite',
            },
            {
                command: 'inspect_details',
                label: 'Camp',
            },
        ];
    }

    private setTilePrompts(key: string) {
        const { tileControlPrompts } = useExploration();
        const fire = this.bonfires[key];

        tileControlPrompts.set({
            commands: [
                {
                    label: `Fire Health: ${fire.health}`,
                    labelColor:
                        fire.health > 70
                            ? 'text-green-500'
                            : fire.health > 30
                              ? 'text-orange-300'
                              : 'text-rose-700',
                },
                ...this.getDefaultPrompts(key),
            ],
        });
    }

    public onTileEnter(key: string) {
        if (!this.bonfires[key]) {
            this.bonfires[key] = {
                intensityScale: 0.5,
                health: 0,
            };
        }

        this.setTilePrompts(key);
        this.captureTileInteractions(key);
    }

    private captureTileInteractions(key: string) {
        const igniteCb = registerInputListener(() => {
            this.ignite(key);
        }, 'confirm');
        const campCb = registerInputListener(() => {
            const { openCamp } = useExploration();
            openCamp();
        }, 'inspect_details');
        setTimeout(() => {
            this.scene.on('moved', () => {
                unregisterInputListener(igniteCb);
                unregisterInputListener(campCb);
            });
        });
    }

    public getBonfireIntensity(key: string) {
        return (this.bonfires[key]?.intensityScale ?? 0) * (this.bonfires[key]?.health ?? 0);
    }
}
