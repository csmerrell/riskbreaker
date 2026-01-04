import { HurtComponent } from '@/game/actors/StrategemActor/components/HurtComponent';
import { StrategemActionComponent } from '../StrategemAction';
import { AnimationComponent } from './AnimationComponent';
import { TargetStrategyComponent } from './TargetStrategyComponent';
import { Animation } from 'excalibur';
import { ProjectileComponent } from './ProjectileComponent';

export class DamageComponent extends StrategemActionComponent {
    public sortPriority = 100;

    public potency: number | number[];
    public damageMap: Record<number, typeof this.potency> = {};
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

    public registerComputedDamage(targetId: number, damage: typeof this.potency) {
        this.damageMap[targetId] = damage;
    }

    public getDamage(targetId: number, hitIdx: number) {
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
                t.getComponent(HurtComponent).setHurtLock(this.owner.id);
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
                            t
                                .getComponent(HurtComponent)
                                ?.startHurt(this.getDamage(t.id, frameDefIdx));
                        });
                    } else if (f.frameIndex === this.tempFrameDefs[0].end) {
                        targets.forEach((t) => {
                            t
                                .getComponent(HurtComponent)
                                ?.endHurt(this.getDamage(t.id, frameDefIdx));
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
            t.getComponent(HurtComponent)?.releaseHurtLock(this.owner.id);
        });
        return Promise.resolve();
    }
}
