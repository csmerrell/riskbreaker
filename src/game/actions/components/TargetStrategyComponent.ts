import { ForecastComponent } from '@/game/actors/StrategemActor/components/ForecastComponent';
import { StrategemActionComponent } from '../StrategemAction';
import { StrategemActor } from '@/game/actors/StrategemActor/StrategemActor';

export class TargetStrategyComponent extends StrategemActionComponent {
    public sortPriority = 1;
    private targetStrategy: () => StrategemActor[];
    private queuedTargets: StrategemActor[] | undefined;
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

    public getTargets() {
        const targets = this.lockTargets ? [...this.queuedTargets] : this.targetStrategy();
        delete this.queuedTargets;
        this.queuedTargets = targets;
        return targets;
    }

    public setTargetStrategy(cb: () => StrategemActor[]) {
        this.targetStrategy = cb;
    }

    public prepare() {
        this.lockTargets = true;
        this.getTargets().forEach((t) => {
            t.getComponent(ForecastComponent).mutateTargetForecasts(this.parent);
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
