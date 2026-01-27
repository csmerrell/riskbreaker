import { Actor, Engine, SpriteSheet } from 'excalibur';

import { spriteMap } from '@/resource/image/units/spriteMap';
import { resources } from '@/resource';

type Armors = 'riskbreakerLeathers' | 'stonecallerRobe';
type Weapons = 'sword' | 'shield';
type HairType = 'ShortMessy' | 'PoofyBob';

export class CompositeActor extends Actor {
    constructor(opts: { armor?: Armors; weapons?: Weapons[]; hair: HairType }) {
        super();
        const { armor: armorKey, weapons: _weaponKeys, hair: _hairKey } = opts;
        const [x, y] = spriteMap.static.frames[0];
        const armor = new Actor();
        const armorSprite = SpriteSheet.fromImageSource({
            image: resources.image.units.armor[armorKey],
            grid: {
                spriteHeight: 24,
                spriteWidth: 24,
                rows: 12,
                columns: 8,
            },
        }).getSprite(x, y);
        armor.graphics.add('static', armorSprite);
        armor.graphics.use('static');
        this.addChild(armor);
    }

    onInitialize(engine: Engine): void {}
}
