import { gameEnum } from '@/lib/enum/game.enum';
import { resources } from '@/resource';
import {
    type AnimationKey,
    COMPOSITE_SPRITE_GRID,
    FrameMap,
    spriteMap,
} from '@/resource/image/units/spriteMap';
import { Actor, Animation, AnimationStrategy, Engine, ImageSource, SpriteSheet } from 'excalibur';

type CompositeType = 'armor' | 'weapon' | 'hair' | 'mannequin';

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
    | {
          type: 'mannequin';
          key: 'mannequin';
      }
);
export class CompositeLayer extends Actor {
    private spriteSheet: SpriteSheet;
    private animations: Partial<Record<AnimationKey, Animation>> = {};

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
            case 'mannequin':
                src = resources.image.units.mannequin;
                break;
        }
        src.load().then(() => {
            this.spriteSheet = SpriteSheet.fromImageSource({
                image: src,
                grid: COMPOSITE_SPRITE_GRID,
            });
            const [x, y] = spriteMap.static.frames[0];
            this.graphics.add('static', this.spriteSheet.getSprite(x, y));
        });
    }

    onInitialize(_engine: Engine): void {
        this.graphics.use('static');
        this.buildAnimations();
    }

    private buildAnimations() {
        (Object.entries(spriteMap) as [AnimationKey, FrameMap][]).forEach(([key, val]) => {
            this.animations[key] = new Animation({
                frames: val.frames.map((f) => ({
                    graphic: this.spriteSheet.getSprite(f[0], f[1]),
                    duration: Math.min(f[2] * gameEnum.frameMs, 1),
                })),
                strategy: AnimationStrategy.Freeze,
            });
            this.graphics.add(key, this.animations[key]);
        });
    }

    public async useAnimation(key: AnimationKey, next?: AnimationKey) {
        return new Promise<void>((resolve) => {
            this.animations[key].reset();
            this.graphics.use(key);
            this.animations[key].events.on('end', () => {
                resolve();
                console.log(`[${key}] animation ended`);
                if (next) {
                    this.useAnimation(next);
                }
            });
        });
    }
}
