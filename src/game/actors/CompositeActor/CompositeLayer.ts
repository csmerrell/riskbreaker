import { gameEnum } from '@/lib/enum/game.enum';
import { resources } from '@/resource';
import {
    type AnimationKey,
    COMPOSITE_SPRITE_GRID,
    FrameMap,
    spriteMap,
} from '@/resource/image/units/spriteMap';
import {
    Actor,
    Animation,
    AnimationStrategy,
    Engine,
    ImageSource,
    Material,
    SpriteSheet,
} from 'excalibur';
import { CompositeSpriteLayers } from './CompositeActor';
import { AccessoryType, ArmorType, HairType, WeaponType } from '@/resource/image/units';
import FOOT_SHADOW from '@/shader/footShadow.glsl?raw';

export type CompositeSpriteMapping = {
    type: CompositeSpriteLayers;
} & (
    | {
          type: 'armor';
          key: ArmorType;
      }
    | {
          type: 'weapon';
          key: WeaponType;
      }
    | {
          type: 'hair';
          key: HairType;
      }
    | {
          type: 'accessory';
          key: AccessoryType;
      }
    | {
          type: 'mannequin';
          key: 'mannequin';
      }
);
type CompositeResourceOpts = CompositeSpriteMapping & {
    isBack?: boolean;
};

export class CompositeLayer extends Actor {
    private spriteSheet: SpriteSheet;
    private animations: Partial<Record<AnimationKey, Animation>> = {};
    private strategyRestore: Partial<Record<AnimationKey, AnimationStrategy>> = {};
    private activeAnimation: Animation;
    private footShadow: Material;

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
                src = resources.image.units.hair[key];
                break;
            case 'accessory':
                src = resources.image.units.accessory[key];
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

    onInitialize(engine: Engine): void {
        this.graphics.use('static');
        this.buildAnimations();
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

    private buildAnimations() {
        (Object.entries(spriteMap) as [AnimationKey, FrameMap][]).forEach(([key, val]) => {
            this.animations[key] = new Animation({
                frames: val.frames.map((f) => ({
                    graphic: this.spriteSheet.getSprite(f[0], f[1]),
                    duration: Math.max(f[2] * gameEnum.frameMs, 1),
                })),
                strategy: AnimationStrategy.Freeze,
            });
            this.graphics.add(key, this.animations[key]);
        });
    }

    public async useAnimation(
        key: AnimationKey,
        opts: {
            strategy?: AnimationStrategy;
            next?: AnimationKey;
        } = {},
    ) {
        const { strategy, next } = opts;
        return new Promise<void>((resolve) => {
            if (strategy) {
                this.strategyRestore[key] = this.animations[key].strategy;
                this.animations[key].strategy = strategy;
            } else if (this.strategyRestore[key]) {
                this.animations[key].strategy = strategy;
            }
            this.animations[key].reset();
            this.activeAnimation = this.animations[key];
            this.graphics.use(key);
            this.animations[key].events.on('end', () => {
                resolve();
                if (next) {
                    this.useAnimation(next);
                }
            });
        });
    }

    public stopAnimation() {
        if (this.activeAnimation) {
            this.activeAnimation.pause();
            this.activeAnimation.reset();
            delete this.activeAnimation;
            this.graphics.use('static');
        }
    }
}
