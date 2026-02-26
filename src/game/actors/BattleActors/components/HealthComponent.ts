import type { StrategemActor } from '../StrategemActor';
import { ActorComponent } from './Component';
import * as ex from 'excalibur';
import { makeState } from '@/state/Observable';

// TODO: inject scale from host game if needed (currently assumes 1:1 pixel scale)
const SCALE = 1;

class HealthBarActor extends ex.Actor {
    private background: ex.Rectangle;
    private foreground: ex.Rectangle;
    private fadeTimer: number = 0;
    private fadeDuration: number = 0.75;
    private opacity: number = 0;
    private owner: StrategemActor;
    private debounceBuffer: number = 0;

    constructor() {
        super({ width: 72 / SCALE, height: 4 / SCALE });
        this.background = new ex.Rectangle({
            width: this.width,
            height: this.height,
            color: ex.Color.fromHex('#1e1e1e'),
        });
        this.foreground = new ex.Rectangle({
            width: this.width,
            height: this.height,
            color: ex.Color.fromHex('#e04a4a'),
        });
        this.graphics.use(
            new ex.GraphicsGroup({
                members: [
                    { graphic: this.background, offset: ex.Vector.Zero },
                    { graphic: this.foreground, offset: ex.Vector.Zero },
                ],
                opacity: 0,
            }),
        );
    }

    public setOwner(owner: StrategemActor) {
        this.owner = owner;
    }

    public updateBar(current: number, max: number) {
        const pct = Math.max(0, Math.min(1, current / max));
        this.foreground.width = this.width * pct;
        this.opacity = 1;
        this.fadeTimer = 0;
    }

    public onPreUpdate(_engine: ex.Engine, delta: number) {
        if (this.opacity === 0) return;

        const previousOpacity = this.opacity;
        if (this.fadeTimer < this.fadeDuration) {
            if (this.debounceBuffer <= 0) {
                this.fadeTimer += delta / 1000;
            } else {
                this.debounceBuffer -= delta / 1000;
            }

            if (this.fadeTimer >= this.fadeDuration) {
                this.opacity = 0;
            } else {
                this.opacity = 1 - this.fadeTimer / this.fadeDuration;
            }
        }
        if (
            this.opacity === 0 ||
            Math.round(previousOpacity / 0.05) !== Math.round(this.opacity / 0.05)
        ) {
            this.graphics.use(
                new ex.GraphicsGroup({
                    members: [
                        { graphic: this.background, offset: ex.Vector.Zero },
                        { graphic: this.foreground, offset: ex.Vector.Zero },
                    ],
                    opacity: this.opacity,
                }),
            );
        }
    }

    public showAndResetFade() {
        this.debounceBuffer = 0.5;
        this.foreground.opacity = 1;
        this.background.opacity = 1;
        this.graphics.use(
            new ex.GraphicsGroup({
                members: [
                    { graphic: this.background, offset: ex.Vector.Zero },
                    { graphic: this.foreground, offset: ex.Vector.Zero },
                ],
            }),
        );
        this.fadeTimer = 0;
    }
}

export class HealthComponent extends ActorComponent {
    public currentHealth = makeState(0);
    public forecastedHealth: number;
    private healthBarActor: HealthBarActor;

    constructor(public baseHealth: number) {
        super('Health');
    }

    onAdd(owner: StrategemActor) {
        super.onAdd(owner);
        this.setHealthFull();

        this.healthBarActor = new HealthBarActor();
        this.healthBarActor.pos = ex.vec(this.owner.graphics.flipHorizontal ? -1 : 1, -12);
        this.healthBarActor.setOwner(this.owner);
        owner.addChild(this.healthBarActor);
    }

    public maxHealth() {
        return this.baseHealth;
    }

    public setHealthFull() {
        this.currentHealth.set(this.maxHealth());
        this.forecastedHealth = this.maxHealth();
        this.updateHealthBar();
    }

    public restoreHealth(amt: number) {
        this.currentHealth.set(Math.min(this.maxHealth(), this.currentHealth.value + amt));
        this.updateHealthBar();
    }

    public forecastRestoration(amt: number) {
        this.forecastedHealth = Math.min(this.maxHealth(), this.forecastedHealth + amt);
    }

    public reduceHealth(amt: number) {
        this.currentHealth.set(Math.max(0, this.currentHealth.value - amt));
        this.updateHealthBar();
    }

    public forecastDamage(amt: number) {
        this.forecastedHealth = Math.max(0, this.forecastedHealth - amt);
    }

    public reconcileForecastedHealth() {
        this.forecastedHealth = this.currentHealth.value;
    }

    private updateHealthBar() {
        if (this.healthBarActor) {
            this.healthBarActor.updateBar(this.currentHealth.value, this.maxHealth());
            this.healthBarActor.showAndResetFade();
        }
    }

    public useHealth() {
        return {
            currentHealth: this.currentHealth,
        };
    }

    public showDamage(_amt: number) {
        //todo
    }

    public showHeal(_amt: number) {
        //todo
    }
}
