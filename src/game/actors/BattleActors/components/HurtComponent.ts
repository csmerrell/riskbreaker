import { Animation, Graphic } from 'excalibur';
import { TargetedComponent } from './TargetedComponent';
import { Animator } from './Animator';
import { HealthComponent } from './HealthComponent';

export class HurtComponent extends TargetedComponent {
    private animationIn: Animation;
    private animationOut: Animation;
    private returnGraphic: Graphic;
    private hurtLocks: Record<string, boolean> = {};

    constructor(opts: { animationIn: Animation; animationOut: Animation }) {
        super('Hurt');
        this.animationIn = opts.animationIn;
        this.animationOut = opts.animationOut;
    }

    public setHurtLock(lockerId: string) {
        this.hurtLocks[lockerId] = true;
        this.owner.isHurtLocked = true;
    }

    public releaseHurtLock(lockerId: string) {
        delete this.hurtLocks[lockerId];
        if (Object.keys(this.hurtLocks).length === 0) {
            this.owner.isHurtLocked = false;
        }
    }

    public startHurt(damage: number) {
        if (!this.owner.isHurtLocked) {
            this.returnGraphic = this.owner.graphics.current;
        }
        this.owner.getComponent(Animator).useAnimation(this.animationIn);
        this.owner.getComponent(HealthComponent).showDamage(damage);
    }

    public endHurt(damage: number) {
        this.owner.getComponent(Animator).useAnimation(this.animationOut, this.returnGraphic);
        this.owner.getComponent(HealthComponent).reduceHealth(damage);
    }
}
