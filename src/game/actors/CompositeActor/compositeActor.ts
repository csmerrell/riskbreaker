import { Actor, ActorArgs, AnimationStrategy } from 'excalibur';
import { CompositeLayer, type CompositeSpriteMapping } from './CompositeLayer';
import type { AnimationKey } from '@/resource/image/units/spriteMap';
import { AccessoryType, ArmorType, HairType, WeaponType } from '@/resource/image/units';

export type CompositeSpriteLayers = 'armor' | 'hair' | 'weapon' | 'accessory' | 'mannequin';

export class CompositeActor extends Actor {
    private armor: CompositeLayer;
    private weapons: CompositeLayer[] = [];
    private hair: CompositeLayer;
    private mannequin: CompositeLayer;
    private accessory: CompositeLayer;

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

        this.equipLayer({ key: 'mannequin', type: 'mannequin' });
        if (armorKey) {
            this.equipLayer({ key: armorKey, type: 'armor' });
        }
        weaponKeys.forEach((weaponKey) => {
            this.equipLayer({ key: weaponKey, type: 'weapon' });
        });
        if (hairKey) {
            this.equipLayer({ key: hairKey, type: 'hair' });
        }
        if (accessoryKey) {
            this.equipLayer({ key: accessoryKey, type: 'accessory' });
        }
    }

    public equipLayer(opts: CompositeSpriteMapping) {
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
}
