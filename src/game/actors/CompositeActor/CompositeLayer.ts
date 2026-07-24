import { resources } from '@/resource';
import {
    type AnimationKey,
    COMPOSITE_SPRITE_GRID,
    spriteMap,
} from '@/resource/image/units/spriteMap';
import { Actor, ActorArgs, Engine, ImageSource, Material, Shader } from 'excalibur';
import { CompositeSpriteLayers } from './CompositeActor';
import { AccessoryType, ArmorType, HairType, HatType, WeaponType } from '@/resource/image/units';
import FOOT_SHADOW from '@/shader/footShadow.glsl?raw';
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
          type: 'hat';
          key: HatType;
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
            case 'hat':
                src = resources.image.units.hat[key];
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
        if (this.type === 'mannequin' && !this.isSilhouette) {
            this.footShadow = engine.graphicsContext.createMaterial({
                name: 'footShadow',
                fragmentSource: FOOT_SHADOW,
            });
            this.graphics.material = this.footShadow;
            this.graphics.material.update((shader) => {
                shader.trySetUniformFloat('u_opacity', this.graphics.opacity);
                shader.trySetUniform('uniform2fv', 'u_origin', [0.5, 0.85]);
                shader.trySetUniformFloat('u_width', 0.25);
                shader.trySetUniformFloat('u_height', 0.05);
            });
        }
    }

    private storedMaterial?: Material;
    public useAnimation(key: AnimationKey, opts: KeyedAnimationOptions<typeof spriteMap> = {}) {
        if (key === 'static' && this.type.match(/mainHand|offHand/)) {
            if (this.graphics) {
                this.graphics.opacity = 0;
            }
            return Promise.resolve();
        } else if (key === 'death' && this.type === 'hair' && this.graphics.material) {
            this.storedMaterial = this.graphics.material;
            this.graphics.material = null;
        } else {
            if (this.storedMaterial) {
                this.graphics.material = this.storedMaterial;
                delete this.storedMaterial;
            }
            return this.get(Animator).useKeyedAnimation(key, opts);
        }
    }

    public stopAnimation() {
        this.get(Animator).stopAnimation();
    }

    public hide() {
        this.graphics.opacity = 0;
    }

    public show() {
        this.graphics.opacity = 1;
    }

    public fadeOut(duration: number = 250) {
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
        this.graphics.material?.update((shader) => {
            shader.trySetUniformFloat('u_opacity', this.graphics.opacity);
        });
    }

    private isSilhouette = false;
    public addMaterialLayer(materialConfig: {
        name: string;
        fragmentSource: string;
        images?: Record<string, ImageSource>;
        setupUniforms?: (shader: Shader) => void;
    }): string {
        if (materialConfig.name === 'silhouette') {
            delete this.footShadow;
            this.graphics.material = null;
            this.isSilhouette = true;
        }
        if (!this.graphics.current) {
            return '';
        }

        const key = `${materialConfig.name}_${this.materialLayerCounter++}`;

        const duplicate = new Actor({
            pos: this.pos,
            z: this.z + 1,
        });
        duplicate.graphics.use(this.graphics.current.clone());

        const material = this.scene!.engine.graphicsContext.createMaterial({
            name: materialConfig.name,
            fragmentSource: materialConfig.fragmentSource,
            images: materialConfig.images ?? {},
        });
        material.update((shader) => {
            if (materialConfig.setupUniforms) {
                materialConfig.setupUniforms?.(shader);
            }
            shader.trySetUniformFloat('u_opacity', this.graphics.opacity);
        });
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
