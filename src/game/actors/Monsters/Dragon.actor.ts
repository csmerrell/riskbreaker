import { resources } from '@/resource';
import {
    Actor,
    Animation,
    AnimationStrategy,
    Engine,
    SpriteSheet,
    type ActorArgs,
} from 'excalibur';
import { ReadyComponent } from '../ReadyComponent';
import { FrameMap } from '@/resource/image/units/spriteMap';
import { gameEnum } from '@/lib/enum/game.enum';
import { AnimationComponent } from '../AnimationComponent';

if (!resources.image.enemy.Dragon.isLoaded()) {
    resources.image.enemy.Dragon.load();
}

const spriteMap = {
    idle: {
        frames: [
            [0, 3, 5],
            [1, 3, 3],
            [2, 3, 3],
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
            [0, 1, 3],
            [1, 1, 2],
            [2, 1, 2],
            [3, 1, 1],
            [4, 1, 2],
            [5, 1, 2],
            [6, 1, 2],
            [7, 1, 1],
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

export class Dragon extends Actor {
    constructor(args: ActorArgs) {
        super(args);
        this.addComponent(new ReadyComponent());
        this.addComponent(
            new AnimationComponent(
                this,
                spriteMap,
                resources.image.enemy.Dragon,
                {
                    spriteHeight: 118,
                    spriteWidth: 145,
                    rows: 8,
                    columns: 8,
                },
                this.get(ReadyComponent),
            ),
        );
    }

    onInitialize(_engine: Engine): void {
        this.graphics.use('idle');
    }

    useAnimation(key: DragonAnimationKey) {
        this.get(AnimationComponent).useKeyedAnimation(key);
    }
}
