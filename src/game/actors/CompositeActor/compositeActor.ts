import { Actor, ActorArgs } from 'excalibur';
import { CompositeLayer } from './CompositeLayer';
import type { AnimationKey } from '@/resource/image/units/spriteMap';

type Armors = 'riskbreakerLeathers' | 'stonecallerRobe';
type Weapons = 'sword' | 'shield';
type HairType = 'shortMessy' | 'poofyBob';

export class CompositeActor extends Actor {
    private armor: CompositeLayer;
    private weapons: CompositeLayer[] = [];
    private hair: CompositeLayer;
    private mannequin: CompositeLayer;

    constructor(opts: ActorArgs & { armor?: Armors; weapons?: Weapons[]; hair: HairType }) {
        super(opts);
        const { armor: armorKey, weapons: weaponKeys = [], hair: hairKey } = opts;
        this.mannequin = new CompositeLayer({ key: 'mannequin', type: 'mannequin' });
        this.addChild(this.mannequin);
        if (armorKey) {
            this.armor = new CompositeLayer({ key: armorKey, type: 'armor' });
            this.addChild(this.armor);
        }
        weaponKeys.forEach((key) => {
            const weapon = new CompositeLayer({ key, type: 'weapon' });
            this.weapons.push(weapon);
            this.addChild(weapon);
        });
        if (hairKey) {
            this.hair = new CompositeLayer({ key: hairKey, type: 'hair' });
        }
    }

    public async useAnimation(key: AnimationKey) {
        const promises: Promise<void>[] = [];
        promises.push(this.armor?.useAnimation(key));
        promises.concat(this.weapons.map((w) => w.useAnimation(key)));
        promises.push(this.hair?.useAnimation(key));
        promises.push(this.mannequin.useAnimation(key));
        return Promise.all(promises);
    }
}
