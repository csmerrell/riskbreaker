import { StrategemActionComponent } from '../StrategemAction';
import { AnimationComponent } from './AnimationComponent';
import { TargetStrategyComponent } from './TargetStrategyComponent';
import { Animation } from 'excalibur';
import { ProjectileComponent } from './ProjectileComponent';

export class RestoreComponent extends StrategemActionComponent {
    public sortPriority = 100;

    public potency: number;
    public animationListenerPromise: Promise<void>;

    private frameDefs: { start: number; end: number };
    private registeredFrameEvent = false;

    constructor() {
        super('Restore');
    }

    public clone() {
        const copy = new RestoreComponent();
        this.hydrateClone(copy);
        return copy;
    }

    protected hydrateClone(copy: RestoreComponent) {
        super.hydrateClone(copy);
        copy.setPotency(this.potency);
        copy.setHealFrames(this.frameDefs);
    }

    public getHealth() {
        return this.potency;
    }

    public setHealFrames(frameDefs: { start: number; end: number }) {
        this.frameDefs = frameDefs;
    }

    public setPotency(potency: number) {
        this.potency = potency;
    }

    public prepare() {
        this.parent
            .getComponent(TargetStrategyComponent)
            ?.getTargets()
            .forEach((t) => {
                // setHealLock goes through IBattleActor — HealedComponent is private
                t.setHealLock(this.owner.actorId);
            });
    }

    public beforeExecute() {
        const graphic = this.parent.hasComponent(ProjectileComponent)
            ? this.parent.getComponent(ProjectileComponent).getGraphic()
            : this.parent.getComponent(AnimationComponent).getGraphicDuring();

        if (graphic instanceof Animation) {
            if (!this.registeredFrameEvent) {
                graphic.events.on('frame', (f) => {
                    const targets = this.parent.getComponent(TargetStrategyComponent)?.getTargets();
                    if (f.frameIndex === this.frameDefs.start) {
                        targets.forEach((t) => {
                            t.startHeal(this.getHealth());
                        });
                    } else if (f.frameIndex === this.frameDefs.end) {
                        targets.forEach((t) => {
                            t.endHeal(this.getHealth());
                        });
                    }
                });
                this.registeredFrameEvent = true;
            }
        }
        return Promise.resolve();
    }

    public afterExecuted() {
        const targets = this.parent.getComponent(TargetStrategyComponent)?.getTargets() ?? [];
        targets.forEach((t) => {
            t.releaseHealLock(this.owner.actorId);
        });
        return Promise.resolve();
    }
}
