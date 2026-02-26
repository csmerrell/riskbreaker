import { Animation, Graphic, Subscription } from 'excalibur';
import type { StrategemActor } from '../StrategemActor';
import { ActorComponent } from './Component';

export class Animator extends ActorComponent {
    protected animationDoneHandler: Subscription;
    protected currentAnimation: Animation;
    declare public owner: StrategemActor;

    constructor() {
        super('Animator');
    }

    onAdd(owner: StrategemActor) {
        this.owner = owner;
    }

    public animationCancel() {
        this.animationDoneHandler?.close();
        this.currentAnimation?.pause();
        this.currentAnimation?.reset();
    }

    public useAnimation(graphic: Graphic, nextGraphic: 'none' | string | Graphic = 'idle') {
        this.animationCancel();

        this.owner.graphics.use(graphic);

        if (graphic instanceof Animation) {
            graphic.reset();
            graphic.play();
            this.currentAnimation = graphic;
            const asPromise = new Promise<void>((resolve) => {
                this.animationDoneHandler = graphic.events.on('end', () => {
                    if (nextGraphic !== 'none') {
                        this.owner.graphics.use(nextGraphic);
                    }

                    this.animationDoneHandler = null;
                    this.currentAnimation = null;
                    resolve();
                });
            });
            return asPromise;
        }
        return Promise.resolve();
    }
}
