import { Animation } from 'excalibur';
import { Animator } from './Animator';
import { ActorComponent } from './Component';
import { Idler } from './Idler';
import { useClock } from '@/state/deprecated/useClock';
import { useBattleParty } from '@/state/deprecated/useBattleParty';
import { useEnemyWave } from '@/state/deprecated/useEnemyWave';

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
                if (this.owner.alignment === 'party') {
                    const { onActorDeath } = useBattleParty();
                    onActorDeath();
                } else {
                    const { onActorDeath } = useEnemyWave();
                    onActorDeath();
                }
                this.owner.hex.clearOverlayFill({ cancel: true });
            });
    }
}
