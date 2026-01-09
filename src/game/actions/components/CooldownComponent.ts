import { useClock } from '@/state/deprecated/useClock';
import { StrategemActionComponent } from '../StrategemAction';

export class CooldownComponent extends StrategemActionComponent {
    public sortPriority = 1000;
    public lastUsed: number = 0;

    constructor(public cooldown: number) {
        super('Cooldown');

        const { tick } = useClock();
        tick.subscribe(() => {
            this.lastUsed = 0;
        });
    }

    public clone() {
        const copy = new CooldownComponent(this.cooldown);
        this.hydrateClone(copy);
        return copy;
    }

    protected hydrateClone(copy: CooldownComponent) {
        super.hydrateClone(copy);
    }

    public canUse(): boolean {
        return this.remainingCooldown() === 0;
    }

    public remainingCooldown() {
        const { tick } = useClock();
        return Math.max(tick.value - (this.lastUsed + this.cooldown), 0);
    }

    public beforeExecute() {
        const { tick } = useClock();
        this.lastUsed = tick.value;
        return Promise.resolve();
    }
}
