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
    Color,
    Engine,
    Graphic,
    ImageSource,
    Material,
    Rectangle,
    Shader,
} from 'excalibur';
import { CompositeSpriteLayers } from './CompositeActor';
import { AccessoryType, ArmorType, HairType, WeaponType } from '@/resource/image/units';
import FOOT_SHADOW from '@/shader/footShadow.glsl?raw';
import GRADIENT_SHIMMER from '@/shader/gradientShimmer.glsl?raw';
import { ReadyComponent } from '../ReadyComponent';
import { Animator } from '../Animation/Animator';
import { KeyedAnimationOptions } from '../useKeyedAnimation';
import { loopUntil } from '@/lib/helpers/async.helper';

export type CompositeSpriteMapping = {
    type: CompositeSpriteLayers;
} & (
    | {
          type: 'armor';
          key: ArmorType;
      }
    | {
          type: 'mainHand';
          key: WeaponType;
      }
    | {
          type: 'offHand';
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
    private footShadow?: Material;
    private type: CompositeSpriteLayers;
    private materialLayers: Record<string, Actor> = {};
    private materialLayerCounter: number = 0;

    constructor(opts: ActorArgs & CompositeResourceOpts) {
        const { type, key, isBack = false, ...excalOpts } = opts;
        super(excalOpts);
        this.type = type;

        let src: ImageSource;
        switch (type) {
            case 'armor':
                src = resources.image.units.armor[key];
                break;
            case 'mainHand':
                const mainHandRoot = resources.image.units.weapon[key];
                src = isBack ? mainHandRoot.back : mainHandRoot.front;
                break;
            case 'offHand':
                const offHandRoot = resources.image.units.weapon[key];
                src = isBack ? offHandRoot.back : offHandRoot.front;
                break;
            case 'hair':
                src = resources.image.units.hair[key];
                break;
            case 'accessory':
                src = resources.image.units.accessory[key];
                break;
            case 'mannequin':
            default:
                src = resources.image.units.mannequin;
                break;
        }

        this.addComponent(new ReadyComponent());
        this.addComponent(
            new Animator(this, spriteMap, src, COMPOSITE_SPRITE_GRID, this.get(ReadyComponent)),
        );

        this.loaded = this.get(ReadyComponent).ready();
    }

    public isLoaded() {
        return this.loaded;
    }

    onInitialize(engine: Engine): void {
        if (this.type === 'mannequin') {
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
    }

    public useAnimation(key: AnimationKey, opts: KeyedAnimationOptions<typeof spriteMap> = {}) {
        return this.get(Animator).useKeyedAnimation(key, opts);
    }

    public stopAnimation() {
        this.get(Animator).stopAnimation();
    }

    public hide() {
        this.graphics.material = null;
        this.graphics.opacity = 0;
    }

    public show() {
        if (this.type === 'mannequin') {
            this.graphics.material = this.footShadow!;
        }
        this.graphics.opacity = 1;
    }

    public fadeOut(duration: number = 250) {
        this.graphics.material = null;
        const step = 25;
        const numSteps = duration / step;
        const opacityStep = -1 / numSteps;
        return loopUntil(
            () => this.graphics.opacity === 0,
            () => this.stepOpacity(opacityStep),
            step,
        );
    }

    public fadeIn(duration: number = 250) {
        if (this.type === 'mannequin') {
            this.graphics.material = this.footShadow!;
        }
        const step = 25;
        const numSteps = duration / step;
        const opacityStep = 1 / numSteps;
        return loopUntil(
            () => this.graphics.opacity === 1,
            () => this.stepOpacity(opacityStep),
            step,
        );
    }

    private stepOpacity(opacityStep: number) {
        const nextOpacity =
            opacityStep < 0
                ? Math.max(0, this.graphics.opacity + opacityStep)
                : Math.min(this.graphics.opacity + opacityStep, 1);
        this.graphics.opacity = nextOpacity;
    }

    public addMaterialLayer(materialConfig: {
        name: string;
        fragmentSource: string;
        setupUniforms?: (shader: Shader) => void;
    }): string {
        const key = `${materialConfig.name}_${this.materialLayerCounter++}`;

        const duplicate = new Actor({
            pos: this.pos,
            z: this.z + 1, // Slightly above original
        });
        duplicate.graphics.use(this.graphics.current!.clone());

        const material = this.scene!.engine.graphicsContext.createMaterial({
            name: materialConfig.name,
            fragmentSource: materialConfig.fragmentSource,
        });
        if (materialConfig.setupUniforms) {
            material.update(materialConfig.setupUniforms);
        }
        duplicate.graphics.material = material;

        this.parent!.addChild(duplicate);
        this.materialLayers[key] = duplicate;

        return key;
    }

    public removeMaterialLayer(key: string): void {
        const layer = this.materialLayers[key];
        if (layer) {
            layer.kill();
            delete this.materialLayers[key];
        }
    }

    public getMaterialLayer(key: string): Actor | undefined {
        return this.materialLayers[key];
    }
}
