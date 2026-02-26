import {
    Actor,
    Animation,
    AnimationStrategy,
    Engine,
    Graphic,
    Sprite,
    SpriteSheet,
} from 'excalibur';

// components
import { ActorComponent, isActorComponent } from './components/Component';
import { Animator } from './components/Animator';
import { Idler } from './components/Idler';
import { DeathComponent } from './components/DeathComponent';
import { TargetedComponent } from './components/TargetedComponent';
import { HealthComponent } from './components/HealthComponent';
import { SpeedComponent } from './components/SpeedComponent';
import { HurtComponent } from './components/HurtComponent';
import { HealedComponent } from './components/HealedComponent';
import { ForecastComponent } from './components/ForecastComponent';

// actions
import { StrategemAction } from '@/game/actions/StrategemAction';

// state
import { useClock } from '@/state/useClock';
import { makeState } from '@/state/Observable';

// lib
import { frameRange } from '@/lib/helpers/number.helper';

// types
import type { IBattleActor } from './IBattleActor';
import type { SpriteSheetSourcedUnitDefinition } from '@/db/units/SourceMappedUnitDef';
import type { InternalSheetAnimation } from '@/db/types';
import { nanoid } from 'nanoid';

export class StrategemActor extends Actor implements IBattleActor {
    // IBattleActor events — engine subscribes
    // onReadyToAct: emits the activation time when CT maxes out (set by SpeedComponent)
    public readonly onReadyToAct = makeState<number>();
    public readonly onDied = makeState<void>();
    public readonly onCtChanged = makeState<number>();

    private targetedBehaviors: TargetedComponent[] = [];

    public actorId: string = '';
    public isActing: boolean = false;
    public isHealLocked: boolean = false;
    public isHurtLocked: boolean = false;
    public sheet: SpriteSheet;
    public initialized = makeState<boolean>(false);

    constructor(
        public name: string,
        public unitDef: SpriteSheetSourcedUnitDefinition,
        public alignment: 'party' | 'enemy',
    ) {
        super();
        this.actorId = nanoid(16);
        this.sheet = SpriteSheet.fromImageSource({
            image: unitDef.spriteSheet.source,
            grid: {
                spriteHeight: unitDef.spriteSheet.cellHeight,
                spriteWidth: unitDef.spriteSheet.cellWidth,
                columns: unitDef.spriteSheet.numCols,
                rows: unitDef.spriteSheet.numRows,
            },
        });
        this.graphics.flipHorizontal = unitDef.spriteSheet.flipHorizontal ?? false;
        this.addStatComponents();
    }

    public getComponent<T extends ActorComponent>(component: new (...args: unknown[]) => T): T {
        return this.components.get(component) as T;
    }

    // ── Lifecycle ────────────────────────────────────────────────────────────

    onInitialize(_engine: Engine): void {
        this.addComponent(new Animator());
        this.addComponent(new Idler());
        this.addEquipComponents();
        this.addSkillComponents();
        this.addHealthComponents();
        this.initialized.set(true);
    }

    private addStatComponents() {
        this.addComponent(new SpeedComponent(this.unitDef.speed.chargePerTick));
    }

    private addEquipComponents() {}

    private addSkillComponents() {}

    private addHealthComponents() {
        const { numCols } = this.unitDef.spriteSheet;
        const { clockMs } = useClock().clockSpeed;
        this.addComponent(new HealthComponent(this.unitDef.health.base));
        this.addComponent(
            new HurtComponent({
                animationIn: Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.hurt.in),
                    clockMs.value * this.unitDef.hurt.in.frameDuration,
                    AnimationStrategy.Freeze,
                ),
                animationOut: Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.hurt.out),
                    clockMs.value * this.unitDef.hurt.out.frameDuration,
                    AnimationStrategy.Freeze,
                ),
            }),
        );
        this.addComponent(
            new HealedComponent({
                animationIn: Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.healed.in),
                    clockMs.value * this.unitDef.healed.in.frameDuration,
                    AnimationStrategy.Freeze,
                ),
                animationOut: Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.healed.out),
                    clockMs.value * this.unitDef.healed.out.frameDuration,
                    AnimationStrategy.Freeze,
                ),
            }),
        );
        this.addComponent(
            new DeathComponent(
                Animation.fromSpriteSheet(
                    this.sheet,
                    frameRange(numCols, this.unitDef.death),
                    clockMs.value * this.unitDef.death.frameDuration,
                    AnimationStrategy.Freeze,
                ),
            ),
        );
        this.addComponent(new ForecastComponent());
    }

    public getTargetedBehaviors() {
        return this.targetedBehaviors;
    }

    // ── IBattleActor: State queries ──────────────────────────────────────────

    public canAct() {
        return !(this.isDead() || this.isActing || this.isHurtLocked || this.isHealLocked);
    }

    public isDead() {
        return this.getComponent(HealthComponent)?.currentHealth.value === 0;
    }

    public willBeDead() {
        return this.getComponent(HealthComponent)?.forecastedHealth === 0;
    }

    // ── IBattleActor: Health queries ─────────────────────────────────────────

    public currentHealth(): number {
        return this.getComponent(HealthComponent)?.currentHealth.value ?? 0;
    }

    public maxHealth(): number {
        return this.getComponent(HealthComponent)?.maxHealth() ?? 0;
    }

    public forecastedHealth(): number {
        return this.getComponent(HealthComponent)?.forecastedHealth ?? 0;
    }

    // ── IBattleActor: Action lifecycle ───────────────────────────────────────

    public beginAction(): void {
        this.isActing = true;
    }

    public endAction(action: StrategemAction): void {
        this.graphics.use('idle');
        this.isActing = false;
        this.getComponent(SpeedComponent)?.resetCt(action);
    }

    // ── IBattleActor: Animation surface ──────────────────────────────────────

    public buildAnimation(key: string): Animation {
        const animDef = this.unitDef.animations[key];
        if (!animDef) {
            throw new Error(`Animation key '${key}' not found in unitDef for '${this.name}'`);
        }
        const { numCols } = this.unitDef.spriteSheet;
        const { clockMs } = useClock().clockSpeed;
        return Animation.fromSpriteSheet(
            this.sheet,
            frameRange(numCols, animDef),
            clockMs.value * animDef.frameDuration,
            AnimationStrategy.Freeze,
        );
    }

    public buildAnimationFromDef(
        anim: InternalSheetAnimation,
        strategy: AnimationStrategy = AnimationStrategy.Freeze,
    ): Animation {
        const { numCols } = this.unitDef.spriteSheet;
        const { clockMs } = useClock().clockSpeed;
        return Animation.fromSpriteSheet(
            this.sheet,
            frameRange(numCols, anim),
            clockMs.value * anim.frameDuration,
            strategy,
        );
    }

    public getSprite(col: number, row: number): Sprite {
        return this.sheet.getSprite(col, row);
    }

    public useAnimation(graphic: Graphic, next?: string | Graphic): Promise<void> {
        return this.getComponent(Animator).useAnimation(graphic, next ?? 'idle');
    }

    // ── IBattleActor: Forecast ────────────────────────────────────────────────

    public applyForecast(action: StrategemAction): void {
        this.getComponent(ForecastComponent).mutateTargetForecasts(action);
    }

    // ── IBattleActor: Hurt surface ────────────────────────────────────────────

    public setHurtLock(lockerId: string): void {
        this.getComponent(HurtComponent)?.setHurtLock(lockerId);
    }

    public startHurt(damage: number): void {
        this.getComponent(HurtComponent)?.startHurt(damage);
    }

    public endHurt(damage: number): void {
        this.getComponent(HurtComponent)?.endHurt(damage);
    }

    public releaseHurtLock(lockerId: string): void {
        this.getComponent(HurtComponent)?.releaseHurtLock(lockerId);
    }

    // ── IBattleActor: Heal surface ────────────────────────────────────────────

    public setHealLock(lockerId: string): void {
        this.getComponent(HealedComponent)?.setHealLock(lockerId);
    }

    public startHeal(health: number): void {
        this.getComponent(HealedComponent)?.startHeal(health);
    }

    public endHeal(health: number): void {
        this.getComponent(HealedComponent)?.endHeal(health);
    }

    public releaseHealLock(lockerId: string): void {
        this.getComponent(HealedComponent)?.releaseHealLock(lockerId);
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────

    public kill() {
        super.kill();
        this.components.forEach((comp) => {
            if (isActorComponent(comp)) {
                comp.cancelClockObservers();
            }
        });
        this.getComponent(SpeedComponent).cancelClockObservers();
    }
}

export function isStrategemActor(a: Actor): a is StrategemActor {
    return a instanceof StrategemActor;
}
