import { Animation, Graphic } from 'excalibur';
import { TargetedComponent } from './TargetedComponent';
import { Animator } from './Animator';
import { HealthComponent } from './HealthComponent';

export class HealedComponent extends TargetedComponent {
    private animationIn: Animation;
    private animationOut: Animation;
    private returnGraphic: Graphic;
    private healLocks: Record<number, boolean> = {};

    constructor(opts: { animationIn: Animation; animationOut: Animation }) {
        super('Healed');
        this.animationIn = opts.animationIn;
        this.animationOut = opts.animationOut;
    }

    public setHealLock(targeterId: number) {
        this.healLocks[targeterId] = true;
        this.owner.isHealLocked = true;
    }

    public releaseHealLock(targeterId: number) {
        delete this.healLocks[targeterId];
        if (Object.keys(this.healLocks).length === 0) this.owner.isHealLocked = false;
    }

    public startHeal(health: number) {
        if (!this.owner.isHealLocked) {
            this.returnGraphic = this.owner.graphics.current;
        }
        this.owner.getComponent(Animator).useAnimation(this.animationIn);
        this.owner.getComponent(HealthComponent).showHeal(health);
    }

    public endHeal(health: number) {
        this.owner.getComponent(Animator).useAnimation(this.animationOut, this.returnGraphic);
        this.owner.getComponent(HealthComponent).restoreHealth(health);
    }
}
