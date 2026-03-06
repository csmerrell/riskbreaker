import { ActorArgs, vec, Vector } from 'excalibur';
import { KeyedAnimationActor } from '../KeyedAnimationActor';
import { FrameMap } from '@/resource/image/units/spriteMap';
import { resources } from '@/resource';
import { ReadyComponent } from '../ReadyComponent';
import { Animator } from '../Animation/Animator';
import { emptyStatMods, UnitStats } from '@/state/battle/UnitStats';

const wolfSpriteMap = {
    static: {
        frames: [[0, 0, 0]],
    },
    idle: {
        frames: [
            [0, 0, 8],
            [1, 0, 6],
            [2, 0, 4],
            [3, 0, 6],
        ],
    },
    forwardJump: {
        frames: [[4, 0, 0]],
    },
    attack: {
        frames: [
            [5, 0, 2],
            [0, 1, 1],
            [1, 1, 1],
            [2, 1, 2],
            [3, 1, 1],
            [4, 1, 1],
            [5, 1, 0],
        ],
    },
    backJump: {
        frames: [[0, 3, 0]],
    },
    charge: {
        frames: [
            [5, 2, 2],
            [0, 3, 0],
        ],
    },
    preHurt: {
        frames: [[3, 4, 0]],
    },
    hurt: {
        frames: [
            [3, 3, 1],
            [4, 3, 1],
            [5, 3, 0],
        ],
    },
    weak: {
        frames: [[0, 4, 0]],
    },
    death: {
        frames: [
            [0, 4, 2],
            [1, 4, 1],
            [2, 4, 1],
            [3, 4, 1],
            [4, 4, 0],
        ],
    },
} as const satisfies Record<string, FrameMap>;

export type WolfAnimationKey = keyof typeof wolfSpriteMap;

const WOLF_SPRITESHEET_GRID = {
    spriteHeight: 32,
    spriteWidth: 48,
    rows: 5,
    columns: 6,
};
export class Wolf extends KeyedAnimationActor<WolfAnimationKey> {
    public static stats: Record<'gray' | 'black', UnitStats> = {
        black: {
            hp: 160,
            currentHp: 160,
            speed: 14,
            strength: 12,
            dexterity: 12,
            balance: 10,
            intelligence: 8,
            wisdom: 8,
            lucidity: 6,
            fortitude: 8,
            mods: emptyStatMods(),
            effects: {},
        },
        gray: {
            hp: 80,
            currentHp: 160,
            speed: 14,
            strength: 6,
            dexterity: 8,
            balance: 6,
            intelligence: 3,
            wisdom: 3,
            lucidity: 3,
            fortitude: 3,
            mods: emptyStatMods(),
            effects: {},
        },
    };
    protected spriteDimensions = WOLF_SPRITESHEET_GRID;
    public battleEntryKey: WolfAnimationKey = 'forwardJump';

    constructor(opts: { palette: 'gray' | 'black' } & ActorArgs) {
        super(opts);
        this.offset = vec(0, -4);

        const { palette } = opts;
        this.addComponent(new ReadyComponent());
        this.addComponent(
            new Animator(
                this,
                wolfSpriteMap,
                resources.image.enemy.Wolf[palette],
                WOLF_SPRITESHEET_GRID,
                this.get(ReadyComponent),
            ),
        );
    }

    public getDimensions() {
        return WOLF_SPRITESHEET_GRID;
    }

    public getHeadshotTransforms(): { offset?: Vector; scale?: Vector } {
        return {
            offset: vec(-2, 10),
        };
    }
}
