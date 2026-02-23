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
    ActorArgs,
    Animation,
    AnimationStrategy,
    Engine,
    Graphic,
    ImageSource,
    Material,
    SpriteSheet,
} from 'excalibur';
import { CompositeSpriteLayers } from './CompositeActor';
import { AccessoryType, ArmorType, HairType, WeaponType } from '@/resource/image/units';
import FOOT_SHADOW from '@/shader/footShadow.glsl?raw';
import { ReadyComponent } from '../ReadyComponent';
import { AnimationComponent } from '../AnimationComponent';
import { KeyedAnimationOptions } from '../useKeyedAnimation';

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
    private loaded!: Promise<void>;
    private spriteSheet!: SpriteSheet;
    private animations: Partial<Record<AnimationKey, Animation>> = {};
    private strategyRestore: Partial<Record<AnimationKey, AnimationStrategy>> = {};
    private activeAnimation?: Animation;
    private footShadow?: Material;
    private graphicSnapshot?: Graphic;

    constructor(opts: ActorArgs & CompositeResourceOpts) {
        const { type, key, isBack = false, ...excalOpts } = opts;

        super(excalOpts);
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

        this.addComponent(new ReadyComponent());
        this.addComponent(
            new AnimationComponent(
                this,
                spriteMap,
                src,
                COMPOSITE_SPRITE_GRID,
                this.get(ReadyComponent),
            ),
        );

        this.loaded = this.get(ReadyComponent).ready();
    }

    public isLoaded() {
        return this.loaded;
    }

    onInitialize(engine: Engine): void {
        this.graphics.use('static');
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

    public async useAnimation(
        key: AnimationKey,
        opts: KeyedAnimationOptions<typeof spriteMap> = {},
    ) {
        this.get(AnimationComponent).useKeyedAnimation(key, opts);
    }

    public stopAnimation() {
        this.get(AnimationComponent).stopAnimation();
    }

    public hide() {
        this.graphicSnapshot = this.graphics.current;
        this.graphics.hide();
    }

    public show() {
        if (!this.graphicSnapshot) return;
        this.graphics.use(this.graphicSnapshot);
        delete this.graphicSnapshot;
    }
}
