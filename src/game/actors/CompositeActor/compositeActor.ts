import { Actor, ActorArgs, AnimationStrategy, Engine, Material } from 'excalibur';
import { CompositeLayer, type CompositeSpriteMapping } from './CompositeLayer';
import type { AnimationKey } from '@/resource/image/units/spriteMap';
import { AccessoryType, ArmorType, HairType, WeaponType } from '@/resource/image/units';
import FOOT_SHADOW from '@/shader/footShadow.glsl?raw';

export type CompositeSpriteLayers =
    | 'armor'
    | 'hair'
    | 'mainHand'
    | 'offHand'
    | 'accessory'
    | 'mannequin';
export type CompositeActorConfig = {
    armor?: ArmorType;
    mainHand?: WeaponType;
    offHand?: WeaponType;
    hair?: HairType;
    accessory?: AccessoryType;
};

export function isCompositeActor(a: Actor): a is CompositeActor {
    return (a as CompositeActor).type === 'CompositeActor';
}

export class CompositeActor extends Actor {
    public type = 'CompositeActor';
    public partyId?: string;
    private mannequin!: CompositeLayer;
    private mainHand?: CompositeLayer;
    private offHand?: CompositeLayer;
    private armor?: CompositeLayer;
    private hair?: CompositeLayer;
    private accessory?: CompositeLayer;
    private footShadow?: Material;
    private currentAnimationKey: AnimationKey = 'static';
    private velCheckCt: number = 0;

    constructor(opts: ActorArgs & CompositeActorConfig) {
        const {
            armor: armorKey,
            mainHand: mainHandKey,
            offHand: offHandKey,
            hair: hairKey,
            accessory: accessoryKey,
            ...excalOpts
        } = opts;
        super(excalOpts);

        this.equipLayer({ key: 'mannequin', type: 'mannequin', ...excalOpts });
        if (armorKey) {
            this.equipLayer({ key: armorKey, type: 'armor', ...excalOpts });
        }
        if (mainHandKey) {
            this.equipLayer({ key: mainHandKey, type: 'mainHand', ...excalOpts });
            this.equipLayer({ key: mainHandKey, type: 'mainHand', ...excalOpts, isBack: true });
        }
        if (offHandKey) {
            this.equipLayer({ key: offHandKey, type: 'offHand', ...excalOpts });
            this.equipLayer({ key: offHandKey, type: 'offHand', ...excalOpts, isBack: true });
        }
        if (hairKey) {
            this.equipLayer({ key: hairKey, type: 'hair', ...excalOpts });
        }
        if (accessoryKey) {
            this.equipLayer({ key: accessoryKey, type: 'accessory', ...excalOpts });
        }
    }

    isLoaded() {
        return Promise.all([
            ...(this.hair ? [this.hair.isLoaded()] : []),
            ...(this.armor ? [this.armor.isLoaded()] : []),
            ...(this.accessory ? [this.accessory.isLoaded()] : []),
            ...(this.mainHand ? [this.mainHand.isLoaded()] : []),
            ...(this.offHand ? [this.offHand.isLoaded()] : []),
            ...(this.mannequin ? [this.mannequin.isLoaded()] : []),
        ]);
    }

    onInitialize(engine: Engine): void {
        this.footShadow = engine.graphicsContext.createMaterial({
            name: 'footShadow',
            fragmentSource: FOOT_SHADOW,
        });
        this.graphics.material = this.footShadow;
        this.graphics.material.update((shader) => {
            shader.trySetUniform('uniform2fv', 'u_origin', [0.5, 0.85]);
            shader.trySetUniformFloat('u_width', 0.25);
            shader.trySetUniformFloat('u_height', 0.05);
        });
    }

    onPreUpdate(_engine: Engine, _elapsed: number): void {
        if (
            !this.suppressMovementAnimation &&
            this.currentAnimationKey.match(/static|walkFace|runFace/)
        ) {
            if (this.vel.magnitude > 0) {
                this.useAnimation('walkFace', {
                    strategy: AnimationStrategy.Loop,
                    noReset: true,
                    noSuppress: true,
                });
            } else {
                setTimeout(() => {
                    if (this.suppressMovementAnimation) return;
                    if (this.vel.magnitude === 0) {
                        if (this.velCheckCt > 4) {
                            this.useAnimation('static');
                        } else {
                            this.velCheckCt++;
                        }
                    } else {
                        this.velCheckCt = 0;
                    }
                }, 25);
            }
        }
    }

    public equipLayer(opts: ActorArgs & CompositeSpriteMapping & { isBack?: boolean }) {
        const layer = new CompositeLayer(opts);
        this[opts.type] = layer;
        switch (opts.type) {
            case 'hair':
                layer.z = 6;
                break;
            case 'mainHand':
                layer.z = 5;
                break;
            case 'offHand':
                layer.z = 4;
                break;
            case 'accessory':
                layer.z = 3;
                break;
            case 'armor':
                layer.z = 2;
                break;
            case 'mannequin':
            default:
                layer.z = 1;
                break;
        }
        if (opts.isBack) {
            layer.z = 0;
        }
        this.addChild(layer);
    }

    private suppressMovementAnimation: boolean = false;
    public async useAnimation(
        key: AnimationKey,
        opts?: {
            strategy?: AnimationStrategy;
            next?: AnimationKey;
            scale?: number;
            noReset?: boolean;
            noSuppress?: boolean;
        },
    ) {
        if (!opts?.noSuppress && key !== 'static') {
            this.suppressMovementAnimation = true;
        } else {
            this.suppressMovementAnimation = false;
        }
        this.currentAnimationKey = key;
        const promises: Promise<void>[] = [];
        promises.push(this.mannequin.useAnimation(key, opts) ?? Promise.resolve());
        promises.push(this.armor?.useAnimation(key, opts) ?? Promise.resolve());
        promises.push(this.mainHand?.useAnimation(key, opts) ?? Promise.resolve());
        promises.push(this.offHand?.useAnimation(key, opts) ?? Promise.resolve());
        promises.push(this.hair?.useAnimation(key, opts) ?? Promise.resolve());
        promises.push(this.accessory?.useAnimation(key, opts) ?? Promise.resolve());
        return Promise.all(promises);
    }

    public stopAnimation() {
        this.mannequin?.stopAnimation();
        this.armor?.stopAnimation();
        this.hair?.stopAnimation();
        this.accessory?.stopAnimation();
        this.mainHand?.stopAnimation();
        this.offHand?.stopAnimation();
    }

    public hide() {
        this.mannequin.hide();
        this.armor?.hide();
        this.mainHand?.hide();
        this.offHand?.hide();
        this.hair?.hide();
        this.accessory?.hide();
    }

    public show() {
        this.mannequin.show();
        this.armor?.show();
        this.mainHand?.show();
        this.offHand?.show();
        this.hair?.show();
        this.accessory?.show();
    }
}
