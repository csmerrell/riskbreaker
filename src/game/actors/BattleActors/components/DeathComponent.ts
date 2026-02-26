import { Animation } from 'excalibur';
import { Animator } from './Animator';
import { ActorComponent } from './Component';
import { Idler } from './Idler';
import { useClock } from '@/state/useClock';

export class DeathComponent extends ActorComponent {
    private tickSubscription: string;

    constructor(private animation: Animation) {
        super('Death');
    }

    public onAdd() {
        this.listenForDeath();
    }

    private listenForDeath() {
        const { tick } = useClock();
        this.tickSubscription = tick.subscribe(() => this.checkDeath());
    }

    public cancelClockObservers() {
        const { tick } = useClock();
        if (this.tickSubscription) {
            tick.unsubscribe(this.tickSubscription);
        }
    }

    private checkDeath() {
        if (!this.owner.isHurtLocked && !this.owner.isHealLocked && this.owner.isDead()) {
            this.die();
        }
    }

    private die() {
        const { tick } = useClock();
        tick.unsubscribe(this.tickSubscription);
        delete this.tickSubscription;

        this.owner
            .getComponent(Idler)
            .changeIdle(this.animation.frames[this.animation.frames.length - 1].graphic!);

        return this.owner
            .getComponent(Animator)
            .useAnimation(this.animation)
            .then(() => {
                // Notify engine and host game that this unit has died.
                // Host game subscribes to actor.onDied to handle party/enemy death tracking.
                this.owner.onDied.set(void 0 as void);
            });
    }
}
