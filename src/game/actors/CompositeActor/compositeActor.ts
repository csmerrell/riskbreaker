import { Actor, ActorArgs, AnimationStrategy, Engine, vec, Vector } from 'excalibur';
import { CompositeLayer, type CompositeSpriteMapping } from './CompositeLayer';
import GRADIENT_SHIMMER from '@/shader/gradientShimmer.glsl?raw';
import {
    COMPOSITE_SPRITE_GRID,
    SpriteGridOptions,
    type AnimationKey,
} from '@/resource/image/units/spriteMap';
import { AccessoryType, ArmorType, HairType, WeaponType } from '@/resource/image/units';
import { progressShader } from '@/lib/helpers/shader.helper';
import { VFXKey, VFXLayer } from './VFXLayer';
import { Animator } from '../Animation/Animator';
import { PartyMember } from '@/state/useParty';
import { HealthComponent } from '../Battle/Health.component';

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
    public unitId?: string;
    public hitPointOffset: Vector = vec(-6, 0);
    private spriteDimensions: SpriteGridOptions = COMPOSITE_SPRITE_GRID;
    private mannequin!: CompositeLayer;
    private mainHand: CompositeLayer[] = [];
    private offHand: CompositeLayer[] = [];
    private armor?: CompositeLayer;
    private hair?: CompositeLayer;
    private accessory?: CompositeLayer;
    private currentAnimationKey: AnimationKey = 'static';

    constructor(private opts: ActorArgs & PartyMember) {
        const { stats, appearance, ...excalOpts } = opts;
        super(excalOpts);

        const {
            armor: armorKey,
            mainHand: mainHandKey,
            offHand: offHandKey,
            hair: hairKey,
            accessory: accessoryKey,
        } = appearance;

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

        this.addComponent(new HealthComponent({ max: stats.hp, current: stats.currentHp }));
    }

    public getDimensions() {
        return this.spriteDimensions;
    }

    public getHeadshotTransforms() {
        return {
            offset: vec(0, 3),
        };
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

    private velCheckCt: number = 0;
    private lastVel = vec(0, 0);
    onPreUpdate(_engine: Engine, _elapsed: number): void {
        if (
            !this.suppressMovementAnimation &&
            this.currentAnimationKey.match(/static|staticBack|walkFace|walkBack|runFace/)
        ) {
            if (this.vel.magnitude > 0) {
                if (this.vel.y < 0 && Math.abs(this.vel.y) > 1) {
                    this.useAnimation('walkBack', {
                        strategy: AnimationStrategy.Loop,
                        noReset: true,
                        noSuppress: true,
                    });
                } else {
                    this.useAnimation('walkFace', {
                        strategy: AnimationStrategy.Loop,
                        noReset: true,
                        noSuppress: true,
                    });
                }
                this.lastVel = this.vel;
            } else {
                setTimeout(() => {
                    if (this.suppressMovementAnimation) return;
                    if (this.vel.magnitude === 0) {
                        if (this.velCheckCt > 4) {
                            if (this.lastVel.y < 0) {
                                this.useAnimation('staticBack');
                            } else {
                                this.useAnimation('static');
                            }
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
    private flatKeys = ['mannequin', 'armor', 'hair', 'accessory'] as const;
    private arrayKeys = ['mainHand', 'offHand'] as const;
    private allLayers() {
        return [
            ...this.flatKeys.map((key) => this[key]).filter((layer) => layer !== undefined),
            ...this.arrayKeys.flatMap((key) => this[key]).filter((layer) => layer !== undefined),
        ];
    }
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
        if (!opts?.noSuppress && !key.match(/static|staticBack/)) {
            this.suppressMovementAnimation = true;
        } else {
            this.suppressMovementAnimation = false;
        }
        this.currentAnimationKey = key;
        return Promise.all(this.allLayers().map((layer) => layer.useAnimation(key, opts))).then(
            () => {
                if (opts?.next) {
                    this.currentAnimationKey = opts.next;
                }
            },
        );
    }

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

    public async preActivateShimmer(animationKey: AnimationKey) {
        return Promise.all(
            this.allLayers().map((layer) => {
                const animation = layer.useAnimation(animationKey);
                // Add shimmer material layer
                const layerKey = layer.addMaterialLayer({
                    name: 'gradientShimmer',
                    fragmentSource: GRADIENT_SHIMMER,
                    setupUniforms: (shader) => {
                        shader.trySetUniformInt('u_sheetFrameCt', 12);
                        shader.trySetUniformFloat('u_progress', 0.0);
                    },
                });

                const shimmerLayer = layer.getMaterialLayer(layerKey)!;
                const duration = 125;

                const shimmer = progressShader(shimmerLayer, duration).then(() => {
                    layer.removeMaterialLayer(layerKey);
                });

                return Promise.all([animation, shimmer]);
            }),
        );
    }

    public async useVFX(
        key: VFXKey,
        opts: {
            offset?: Vector;
        } = {},
    ) {
        const vfxLayer = new VFXLayer(key, opts);
        this.addChild(vfxLayer);
        await vfxLayer.animate();
        this.removeChild(vfxLayer);
    }
}
