import { Actor, ActorArgs, AnimationStrategy, Engine, Material } from 'excalibur';
import { CompositeLayer, type CompositeSpriteMapping } from './CompositeLayer';
import type { AnimationKey } from '@/resource/image/units/spriteMap';
import { AccessoryType, ArmorType, HairType, WeaponType } from '@/resource/image/units';
import FOOT_SHADOW from '@/shader/footShadow.glsl?raw';

export type CompositeSpriteLayers = 'armor' | 'hair' | 'weapon' | 'accessory' | 'mannequin';

export function isCompositeActor(a: Actor): a is CompositeActor {
    return (a as CompositeActor).type === 'CompositeActor';
}

export class CompositeActor extends Actor {
    public type = 'CompositeActor';
    private armor: CompositeLayer;
    private weapons: CompositeLayer[] = [];
    private hair: CompositeLayer;
    private mannequin: CompositeLayer;
    private accessory: CompositeLayer;
    private footShadow: Material;
    private excalOpts: ActorArgs;

    constructor(
        opts: ActorArgs & {
            armor?: ArmorType;
            weapons?: WeaponType[];
            hair?: HairType;
            accessory?: AccessoryType;
        },
    ) {
        const {
            armor: armorKey,
            weapons: weaponKeys = [],
            hair: hairKey,
            accessory: accessoryKey,
            ...excalOpts
        } = opts;
        super(excalOpts);

        this.excalOpts = excalOpts;
        this.equipLayer({ key: 'mannequin', type: 'mannequin', ...excalOpts });
        if (armorKey) {
            this.equipLayer({ key: armorKey, type: 'armor', ...excalOpts });
        }
        weaponKeys.forEach((weaponKey) => {
            this.equipLayer({ key: weaponKey, type: 'weapon', ...excalOpts });
        });
        if (hairKey) {
            this.equipLayer({ key: hairKey, type: 'hair', ...excalOpts });
        }
        if (accessoryKey) {
            this.equipLayer({ key: accessoryKey, type: 'accessory', ...excalOpts });
        }
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

    public equipLayer(opts: ActorArgs & CompositeSpriteMapping) {
        const layer = new CompositeLayer(opts);
        if (opts.type === 'weapon') {
            this.weapons.push(layer);
        } else {
            this[opts.type] = layer;
        }
        this.addChild(layer);
    }

    public async useAnimation(
        key: AnimationKey,
        opts: {
            strategy?: AnimationStrategy;
            next?: Animation;
        },
    ) {
        const promises: Promise<void>[] = [];
        const { strategy } = opts;
        promises.push(this.armor?.useAnimation(key, { strategy }));
        promises.concat(this.weapons.map((w) => w.useAnimation(key, { strategy })));
        promises.push(this.hair?.useAnimation(key, { strategy }));
        promises.push(this.accessory?.useAnimation(key, { strategy }));
        promises.push(this.mannequin.useAnimation(key, { strategy }));
        return Promise.all(promises);
    }

    public stopAnimation() {
        this.armor?.stopAnimation();
        this.hair?.stopAnimation();
        this.accessory?.stopAnimation();
        this.mannequin?.stopAnimation();
        this.weapons.forEach((w) => w.stopAnimation());
    }

    public hide() {
        this.armor.hide();
        this.weapons.forEach((w) => w.hide());
        this.hair.hide();
        this.mannequin.hide();
        this.accessory.hide();
    }

    public show() {
        this.armor.show();
        this.weapons.forEach((w) => w.show());
        this.hair.show();
        this.mannequin.show();
        this.accessory.show();
    }
}
