import { Actor, ActorArgs, AnimationStrategy, Engine, Material, Animation } from 'excalibur';
import { CompositeLayer, type CompositeSpriteMapping } from './CompositeLayer';
import type { AnimationKey } from '@/resource/image/units/spriteMap';
import { AccessoryType, ArmorType, HairType, WeaponType } from '@/resource/image/units';
import FOOT_SHADOW from '@/shader/footShadow.glsl?raw';
import { KeyedAnimationActor } from '../KeyedAnimationActor';

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

export class CompositeActor extends KeyedAnimationActor {
    public type = 'CompositeActor';
    public partyId?: string;
    private mannequin!: CompositeLayer;
    private mainHand: CompositeLayer[] = [];
    private offHand: CompositeLayer[] = [];
    private armor?: CompositeLayer;
    private hair?: CompositeLayer;
    private accessory?: CompositeLayer;
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
            ...this.mainHand.map((mh) => mh.isLoaded()),
            ...this.offHand.map((oh) => oh.isLoaded()),
            ...(this.mannequin ? [this.mannequin.isLoaded()] : []),
        ]);
    }

    onInitialize(_engine: Engine): void {}

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

        if (opts.type === 'mainHand' || opts.type === 'offHand') {
            this[opts.type].push(layer);
        } else {
            this[opts.type] = layer;
        }

        this.addChild(layer);
    }

    private suppressMovementAnimation: boolean = false;
    public useAnimation(
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
        promises.push(...this.mainHand.map((mh) => mh.useAnimation(key, opts)));
        promises.push(...this.offHand.map((oh) => oh.useAnimation(key, opts)));
        promises.push(this.hair?.useAnimation(key, opts) ?? Promise.resolve());
        promises.push(this.accessory?.useAnimation(key, opts) ?? Promise.resolve());
        return Promise.all(promises);
    }

    private flatKeys = ['mannequin', 'armor', 'hair', 'accessory'] as const;
    private arrayKeys = ['mainHand', 'offHand'] as const;
    public stopAnimation() {
        this.flatKeys.forEach((key) => this[key]?.stopAnimation());
        this.arrayKeys.forEach((key) => this[key].forEach((layer) => layer.stopAnimation()));
    }

    public hide() {
        this.flatKeys.forEach((key) => this[key]?.hide());
        this.arrayKeys.forEach((key) => this[key].forEach((layer) => layer.hide()));
    }

    public show() {
        this.flatKeys.forEach((key) => this[key]?.show());
        this.arrayKeys.forEach((key) => this[key].forEach((layer) => layer.show()));
    }

    public fadeOut(duration: number = 250) {
        return new Promise<void>(async (resolve) => {
            await Promise.all([
                ...this.flatKeys.map(async (key) => this[key]?.fadeOut(duration)),
                ...this.arrayKeys.flatMap((key) =>
                    this[key].map((layer) => layer.fadeOut(duration)),
                ),
            ]);
            resolve();
        });
    }

    public fadeIn(duration: number = 250) {
        return new Promise<void>(async (resolve) => {
            await Promise.all([
                ...this.flatKeys.map(async (key) => this[key]?.fadeIn(duration)),
                ...this.arrayKeys.flatMap((key) =>
                    this[key].map((layer) => layer.fadeIn(duration)),
                ),
            ]);
            resolve();
        });
    }
}
