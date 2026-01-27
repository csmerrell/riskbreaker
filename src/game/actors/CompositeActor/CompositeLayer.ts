import { resources } from '@/resource';
import { COMPOSITE_SPRITE_GRID, spriteMap } from '@/resource/image/units/spriteMap';
import { Actor, ImageSource, SpriteSheet } from 'excalibur';

type CompositeType = 'armor' | 'weapon' | 'hair';

type CompositeResourceOpts = {
    type: CompositeType;
    isBack?: boolean;
} & (
    | {
          type: 'armor';
          key: keyof typeof resources.image.units.armor;
      }
    | {
          type: 'weapon';
          key: keyof typeof resources.image.units.weapon;
      }
    | {
          type: 'hair';
          key: keyof typeof resources.image.units.hair;
      }
);
export class CompositeLayer extends Actor {
    private spriteSheet: SpriteSheet;
    constructor(opts: CompositeResourceOpts) {
        super();
        const { type, key, isBack = false } = opts;
        let src: ImageSource;
        switch (type) {
            case 'armor':
                src = resources.image.units.armor[key];
                break;
            case 'weapon':
                const weaponRoot = resources.image.units.weapon[key];
                src = isBack ? weaponRoot.back : weaponRoot.front;
                break;
            case 'hair':
                src = resources.image.units.hair[opts.key];
                break;
        }
        src.load().then(() => {
            this.spriteSheet = SpriteSheet.fromImageSource({
                image: src,
                grid: COMPOSITE_SPRITE_GRID,
            });
            const [x, y] = spriteMap.static.frames[0];
            this.graphics.add('static', this.spriteSheet.getSprite(x, y));
            this.graphics.use('static');
        });
    }
}
