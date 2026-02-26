import type { IBattleActor } from '@/game/actors/IBattleActor';
import { StrategemActionComponent } from '../StrategemAction';

export class TargetStrategyComponent extends StrategemActionComponent {
    public sortPriority = 1;
    private targetStrategy: () => IBattleActor[];
    private queuedTargets: IBattleActor[] | undefined;
    private lockTargets: boolean = false;

    constructor() {
        super('TargetStrategy');
    }

    public clone() {
        const copy = new TargetStrategyComponent();
        this.hydrateClone(copy);
        return copy;
    }

    protected hydrateClone(copy: TargetStrategyComponent) {
        super.hydrateClone(copy);
        copy.setTargetStrategy(this.targetStrategy);
    }

    public getTargets(): IBattleActor[] {
        const targets = this.lockTargets ? [...this.queuedTargets] : this.targetStrategy();
        delete this.queuedTargets;
        this.queuedTargets = targets;
        return targets;
    }

    public setTargetStrategy(cb: () => IBattleActor[]) {
        this.targetStrategy = cb;
    }

    public prepare() {
        this.lockTargets = true;
        this.getTargets().forEach((t) => {
            // applyForecast goes through IBattleActor — ForecastComponent is private
            t.applyForecast(this.parent);
        });
    }

    public beforeExecute(): Promise<unknown> {
        return Promise.resolve();
    }

    public onExecute(): Promise<unknown> {
        return Promise.resolve();
    }

    public afterExecuted(): Promise<unknown> {
        return Promise.resolve();
    }

    public cleanup() {
        this.lockTargets = false;
        delete this.queuedTargets;
    }
}
