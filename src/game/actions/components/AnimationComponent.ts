import { Graphic } from 'excalibur';
import { StrategemActionComponent } from '../StrategemAction';
import { ProjectileComponent } from './ProjectileComponent';

export class AnimationComponent extends StrategemActionComponent {
    public sortPriority = 10;
    private graphicBefore?: Graphic;
    private graphicDuring: Graphic;
    private graphicAfter?: Graphic;

    constructor() {
        super('Animation');
    }

    public clone() {
        const copy = new AnimationComponent();
        this.hydrateClone(copy);
        return copy;
    }

    protected hydrateClone(copy: AnimationComponent) {
        super.hydrateClone(copy);
        copy.setGraphicAfter(this.graphicAfter);
        copy.setGraphicBefore(this.graphicBefore);
        copy.setGraphicDuring(this.graphicDuring);
    }

    public setGraphicBefore(graphic: Graphic) {
        this.graphicBefore = graphic;
    }

    public setGraphicDuring(graphic: Graphic) {
        this.graphicDuring = graphic;
    }

    public setGraphicAfter(graphic: Graphic) {
        this.graphicAfter = graphic;
    }

    public getGraphicDuring() {
        return this.graphicDuring;
    }

    public emitKeys() {
        return {
            animatedBefore: `animatedBefore_${this.id}`,
            animatedDuring: `animatedDuring_${this.id}`,
            animatedAfter: `animatedAfter_${this.id}`,
        };
    }

    public async animate(lifecycle: 'before' | 'during' | 'after') {
        const graphic =
            lifecycle === 'before'
                ? this.graphicBefore
                : lifecycle === 'during'
                  ? this.graphicDuring
                  : this.graphicAfter;

        if (graphic) {
            // useAnimation goes through IBattleActor — Animator is private
            return this.owner.useAnimation(graphic, lifecycle === 'after' ? 'idle' : 'none');
        }

        return Promise.resolve();
    }

    public async beforeExecute() {
        return this.animate('before');
    }

    public async onExecute() {
        return this.animate('during').then(async () => {
            if (this.parent.hasComponent(ProjectileComponent)) {
                await this.parent.getComponent(ProjectileComponent).executeProjectile();
            }
        });
    }

    public async afterExecuted() {
        return this.animate('after');
    }
}
