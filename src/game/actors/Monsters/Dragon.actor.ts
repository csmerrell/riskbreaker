import { resources } from '@/resource';
import {
    Actor,
    AnimationStrategy,
    BoundingBox,
    Color,
    Engine,
    FrameEvent,
    Rectangle,
    vec,
    Vector,
    type ActorArgs,
} from 'excalibur';
import { ReadyComponent } from '../ReadyComponent';
import { FrameMap, type AnimationKey } from '@/resource/image/units/spriteMap';
import { Animator } from '../Animation/Animator';
import { KeyedAnimationActor } from '../KeyedAnimationActor';
import { useExploration } from '@/state/useExploration';

if (!resources.image.enemy.Dragon.isLoaded()) {
    resources.image.enemy.Dragon.load();
}

const spriteMap = {
    idle: {
        frames: [
            [0, 3, 40],
            [1, 3, 30],
            [2, 3, 5],
        ],
    },
    flyHorizontal: {
        frames: [[0, 0, 0]],
    },
    flyPivot: {
        frames: [
            [0, 0, 1],
            [1, 0, 2],
            [2, 0, 0],
        ],
    },
    flyVertical: {
        frames: [[2, 0, 0]],
    },
    hover: {
        frames: [
            [0, 1, 4],
            [1, 1, 3],
            [2, 1, 3],
            [3, 1, 2],
            [4, 1, 3],
            [5, 1, 3],
            [6, 1, 3],
            [7, 1, 2],
        ],
    },
    touchDown: {
        frames: [
            [0, 2, 2],
            [1, 2, 2],
            [2, 2, 2],
            [3, 2, 0],
        ],
    },
    roar: {
        frames: [
            [4, 3, 1],
            [5, 3, 0],
        ],
    },
    tailWhip: {
        frames: [
            [0, 4, 2],
            [1, 4, 2],
            [2, 4, 2],
            [3, 4, 1],
            [4, 4, 1],
            [5, 4, 0],
        ],
    },
    backStepHold: {
        frames: [
            [0, 5, 2],
            [1, 5, 0],
        ],
    },
    backStepEnd: {
        frames: [
            [1, 5, 1],
            [2, 5, 0],
        ],
    },
    hurt: {
        frames: [[1, 6, 0]],
    },
    knockdown: {
        frames: [
            [1, 6, 1],
            [2, 6, 0],
        ],
    },
} as const satisfies Record<string, FrameMap>;
type DragonAnimationKey = keyof typeof spriteMap;

const DRAGON_SPRITESHEET_GRID = {
    spriteHeight: 118,
    spriteWidth: 145,
    rows: 8,
    columns: 8,
};

export class Dragon extends KeyedAnimationActor {
    constructor(args: ActorArgs = {}) {
        super(args);
        this.offset = vec(4, -24);
        this.addComponent(new ReadyComponent());
        this.addComponent(
            new Animator(
                this,
                spriteMap,
                resources.image.enemy.Dragon,
                DRAGON_SPRITESHEET_GRID,
                this.get(ReadyComponent),
            ),
        );
    }

    public battleFieldEntry(pos: Vector): Promise<void> {
        this.pos = vec(pos.x, pos.y - 125);
        this.useAnimation('hover', {
            strategy: AnimationStrategy.Loop,
        });
        this.vel = vec(0, 16);
        return new Promise<void>((resolve) => {
            const interval = setInterval(() => {
                if (this.pos.y >= pos.y) {
                    this.vel = vec(0, 0);
                    this.useAnimation('touchDown').then(() => {
                        resolve();
                    });
                    clearInterval(interval);
                    return;
                }
            }, 25);

            this.get(Animator).registerAnimationEvent('frame', (e: FrameEvent) => {
                switch (e.frameIndex) {
                    case 2:
                        this.vel = this.vel.add(vec(0, -5));
                        break;
                    case 3:
                        this.vel = vec(0, 0);
                        break;
                    case 4:
                        this.vel = vec(0, -10);
                        break;
                    default:
                        this.vel = this.vel.add(vec(0, 16));
                        break;
                }
            });
        });
    }

    public useAnimation(
        key: DragonAnimationKey,
        opts?: {
            strategy?: AnimationStrategy;
            next?: AnimationKey;
            scale?: number;
            noReset?: boolean;
            noSuppress?: boolean;
        },
    ): Promise<void> {
        return this.get(Animator).useKeyedAnimation(key, opts);
    }
}
