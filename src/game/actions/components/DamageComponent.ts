import { StrategemActionComponent } from '../StrategemAction';
import { AnimationComponent } from './AnimationComponent';
import { TargetStrategyComponent } from './TargetStrategyComponent';
import { Animation } from 'excalibur';
import { ProjectileComponent } from './ProjectileComponent';

export class DamageComponent extends StrategemActionComponent {
    public sortPriority = 100;

    public potency: number | number[];
    public damageMap: Record<string, typeof this.potency> = {};
    public animationListenerPromise: Promise<void>;

    private frameDefs: { start: number; end: number }[];
    private tempFrameDefs: typeof this.frameDefs;
    private registeredFrameEvent = false;

    constructor() {
        super('Damage');
    }

    public clone() {
        const copy = new DamageComponent();
        this.hydrateClone(copy);
        return copy;
    }

    protected hydrateClone(copy: DamageComponent) {
        super.hydrateClone(copy);
        copy.setPotency(this.potency);
        copy.setHurtFrames(this.frameDefs);
    }

    public registerComputedDamage(targetId: string, damage: typeof this.potency) {
        this.damageMap[targetId] = damage;
    }

    public getDamage(targetId: string, hitIdx: number) {
        const targetDamage = this.damageMap[targetId];
        return Array.isArray(targetDamage) ? targetDamage[hitIdx] : targetDamage;
    }

    public setHurtFrames(frameDefs: { start: number; end: number }[]) {
        this.frameDefs = frameDefs;
    }

    public setPotency(potency: number | number[]) {
        this.potency = potency;
    }

    public prepare() {
        this.parent
            .getComponent(TargetStrategyComponent)
            ?.getTargets()
            .forEach((t) => {
                // setHurtLock goes through IBattleActor — HurtComponent is private
                t.setHurtLock(this.owner.actorId);
            });
    }

    public beforeExecute() {
        const graphic = this.parent.hasComponent(ProjectileComponent)
            ? this.parent.getComponent(ProjectileComponent).getGraphic()
            : this.parent.getComponent(AnimationComponent).getGraphicDuring();

        if (graphic instanceof Animation) {
            this.tempFrameDefs = [...(this.frameDefs ?? [])];
            if (!this.registeredFrameEvent) {
                graphic.events.on('frame', (f) => {
                    const targets = this.parent.getComponent(TargetStrategyComponent)?.getTargets();
                    if (this.tempFrameDefs.length === 0) {
                        return;
                    }

                    const frameDefIdx = this.frameDefs.length - this.tempFrameDefs.length;
                    if (f.frameIndex === this.tempFrameDefs[0].start) {
                        targets.forEach((t) => {
                            t.startHurt(this.getDamage(t.actorId, frameDefIdx));
                        });
                    } else if (f.frameIndex === this.tempFrameDefs[0].end) {
                        targets.forEach((t) => {
                            t.endHurt(this.getDamage(t.actorId, frameDefIdx));
                        });
                        this.tempFrameDefs.shift();
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
            t.releaseHurtLock(this.owner.actorId);
        });
        return Promise.resolve();
    }
}
