import {
    Actor,
    Animation,
    AnimationStrategy,
    Component,
    ImageSource,
    SpriteSheet,
} from 'excalibur';
import { ReadyComponent } from './ReadyComponent';
import { FrameMap } from '@/resource/image/units/spriteMap';
import { gameEnum } from '@/lib/enum/game.enum';

export class AnimationComponent<T extends Record<string, FrameMap>> extends Component {
    private spriteSheet!: SpriteSheet;
    private animations: Record<keyof T, Animation> = {} as Record<keyof T, Animation>;
    private strategyRestore: Partial<Record<keyof T, AnimationStrategy>> = {};
    private activeAnimation?: Animation;

    constructor(
        public owner: Actor,
        private spriteMap: T,
        private spriteSrc: ImageSource,
        private spriteGrid: {
            spriteHeight: number;
            spriteWidth: number;
            rows: number;
            columns: number;
        },
        private readyComponent: ReadyComponent,
    ) {
        super();
        readyComponent.registerDependency('animation');
        if (!spriteSrc.isLoaded()) {
            spriteSrc.load().then(() => this.init());
        } else {
            setTimeout(() => this.init(), 0);
        }
    }

    private init() {
        this.buildSpriteSheet();
        this.buildAnimations();
        this.readyComponent.resolve('animation');
    }

    private buildSpriteSheet() {
        this.spriteSheet = SpriteSheet.fromImageSource({
            image: this.spriteSrc,
            grid: this.spriteGrid,
        });
    }

    private buildAnimations() {
        (Object.entries(this.spriteMap) as [keyof T, FrameMap][]).forEach(([key, val]) => {
            this.animations[key] = new Animation({
                frames: val.frames.map((f) => ({
                    graphic: this.spriteSheet.getSprite(f[0], f[1]),
                    duration: Math.max(f[2] * gameEnum.frameMs, 1),
                })),
                strategy: AnimationStrategy.Freeze,
            });
            this.owner.graphics.add(key as string, this.animations[key]);
        });
    }

    public useKeyedAnimation(
        key: keyof T,
        opts: {
            strategy?: AnimationStrategy;
            next?: string;
            noReset?: boolean;
            scale?: number;
        } = {},
    ) {
        const { strategy, next } = opts;
        return new Promise<void>((resolve) => {
            if (!this.animations[key]) {
                return;
            }
            if (strategy) {
                this.strategyRestore[key] = this.animations[key].strategy;
                this.animations[key].strategy = strategy;
            } else if (this.strategyRestore[key]) {
                this.animations[key].strategy = this.strategyRestore[key];
            }
            if (!opts.noReset) {
                this.animations[key].reset();
            }
            this.activeAnimation = this.animations[key];
            this.activeAnimation.frames.forEach(
                (f) => f.duration && (f.duration /= opts.scale ?? 1),
            );
            this.owner.graphics.use(this.activeAnimation);
            this.activeAnimation.events.on('end', () => {
                resolve();
                if (next) {
                    this.useKeyedAnimation(next);
                }
            });
        });
    }

    public stopAnimation() {
        if (this.activeAnimation) {
            this.activeAnimation.pause();
            this.activeAnimation.reset();
            delete this.activeAnimation;
            this.owner.graphics.use('static');
        }
    }
}
