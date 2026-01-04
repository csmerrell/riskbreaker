import { StrategemAction } from '@/game/actions/StrategemAction';
import { ActorComponent } from './Component';
import { useClock } from '@/state/useClock';
export const MAX_CT = 100;
export class SpeedComponent extends ActorComponent {
    private ct = 0;
    private tickSubscription: string;

    constructor(private baseSpeed: number) {
        super('Speed');

        const { tick } = useClock();
        this.tickSubscription = tick.subscribe(() => this.onTick());
    }

    public cancelClockObservers() {
        const { tick } = useClock();
        tick.unsubscribe(this.tickSubscription);
    }

    public chargePerTick() {
        return this.baseSpeed;
    }

    public ticksToActivate() {
        return (1.0 * (MAX_CT - this.ct)) / this.chargePerTick();
    }

    public resetCt(action: StrategemAction) {
        this.ct = Math.max(this.ct - action.ctCost, 0);

        this.owner.hex.clearOverlayFill();
    }

    public addChargeEntropy(speedToBand: Map<number, number>, bandWidth: number) {
        const bandIdx = speedToBand.get(this.chargePerTick()) ?? 0;
        const bandMin = bandWidth * bandIdx;
        const bandMax = bandMin + bandWidth;

        // Calculate lower bound for overlap
        const overlapMin = bandMin - (bandMax - bandMin) * 1.33;

        // Clamp to [0, MAX_CT]
        this.ct = Math.max(
            0,
            Math.min(MAX_CT, overlapMin + Math.random() * (bandMax - overlapMin)),
        );

        this.startATB();
    }

    public startATB() {
        this.owner.hex.calibrateATB(this.chargePerTick.bind(this), this.ct / MAX_CT);
        this.owner.hex.runATB();
    }

    public currentComputedCT() {
        const { tick, tickRate, isRunning } = useClock();
        if (!isRunning.value) {
            return this.ct;
        }

        const timeSinceLastTick = Date.now() - tick.value;
        const changeInCT = ~~(this.chargePerTick() * (timeSinceLastTick / tickRate.value));
        return this.ct + changeInCT;
    }

    public onTick() {
        this.ct = Math.min(this.chargePerTick() + this.ct, MAX_CT);
        if (this.ct === MAX_CT) {
            this.owner.act();
        }
    }
}
