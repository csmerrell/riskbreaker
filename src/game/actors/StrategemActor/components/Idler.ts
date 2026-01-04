import { Animation, AnimationStrategy, Graphic } from 'excalibur';
import { useClock } from '@/state/useClock';
import { ActorComponent } from './Component';
import { StrategemActor } from '../StrategemActor';
import { frameRange } from '@/lib/helpers/number.helper';

export class Idler extends ActorComponent {
    private animation: Animation;
    constructor() {
        super('Idler');
    }

    onAdd(owner: StrategemActor) {
        super.onAdd(owner);
        const { numCols } = this.owner.unitDef.spriteSheet;
        const idle = this.owner.unitDef.animations.idle;
        const { clockMs } = useClock().clockSpeed;
        this.animation = Animation.fromSpriteSheet(
            this.owner.sheet,
            frameRange(numCols, idle),
            clockMs.value * (idle.frameDuration ?? 8),
            AnimationStrategy.Loop,
        );
        this.owner.graphics.add('idle', this.animation);
        this.owner.graphics.use('idle');
    }

    changeIdle(graphic: Graphic) {
        this.owner.graphics.add('idle', graphic);
    }

    resetIdle() {
        this.owner.graphics.add('idle', this.animation);
    }
}
