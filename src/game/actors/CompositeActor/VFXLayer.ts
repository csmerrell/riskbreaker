import { resources } from '@/resource';
import { FrameMap } from '@/resource/image/units/spriteMap';
import { Actor, ActorArgs, ImageSource, vec, Vector } from 'excalibur';
import { Animator } from '../Animation/Animator';
import { ReadyComponent } from '../ReadyComponent';
import { getScale } from '@/lib/helpers/screen.helper';

const frames: [number, number, number][] = [
    [0, 5, 1],
    [1, 5, 1],
    [2, 5, 1],
    [3, 5, 1],
    [4, 5, 1],
    [5, 5, 1],
    [6, 5, 1],
    [7, 5, 1],
    [8, 5, 1],
    [9, 5, 0],
];
const VFXMap = {
    footRing: {
        src: resources.image.vfx.FootRing,
        frames,
        offset: vec(0, 0),
    },
    radialDust: {
        src: resources.image.vfx.RadialDust,
        frames,
        offset: vec(0, 12),
    },
    forwardImpact: {
        src: resources.image.vfx.ForwardImpact,
        frames,
        offset: vec(48, -12),
    },
} as const satisfies Record<string, { src: ImageSource; offset?: Vector } & FrameMap>;
export type VFXKey = keyof typeof VFXMap;

const VFX_SPRITE_GRID = {
    spriteHeight: 64,
    spriteWidth: 64,
    rows: 9,
    columns: 10,
};

export class VFXLayer extends Actor {
    constructor(
        private key: VFXKey,
        args?: ActorArgs,
    ) {
        super(args);
        this.addComponent(new ReadyComponent());
        this.addComponent(
            new Animator(this, VFXMap, VFXMap[key].src, VFX_SPRITE_GRID, this.get(ReadyComponent)),
        );
        this.scale = vec(1, 1).scale((1 / getScale()) * 3);
        this.offset = (args?.offset ?? VFXMap[key].offset).scale(this.scale);
        this.graphics.opacity = args?.opacity ?? 0.5;
    }

    public async animate() {
        await this.get(ReadyComponent).ready();
        return this.get(Animator).useKeyedAnimation(this.key);
    }
}
