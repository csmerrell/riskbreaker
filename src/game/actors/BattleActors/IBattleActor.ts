import { Animation, AnimationStrategy, Graphic, Sprite } from 'excalibur';
import { Observable } from '@/state/Observable';
import type { StrategemAction } from '@/game/actions/StrategemAction';
import type { InternalSheetAnimation } from '@/db/types';

// The narrow interface the Strategem Engine uses to communicate with any battle actor.
// StrategemActor implements this. Host game actors implement this.
// Engine-side code (useActionBus, action components, Targeting) is typed to IBattleActor only.
export interface IBattleActor {
    // Identity
    readonly actorId: string;
    readonly alignment: 'party' | 'enemy';

    // State queries — read-only from the Strategem Engine
    readonly isActing: boolean;
    readonly isHurtLocked: boolean;
    readonly isHealLocked: boolean;
    isDead(): boolean;
    willBeDead(): boolean;
    canAct(): boolean;

    // Health queries — used by Targeting
    currentHealth(): number;
    maxHealth(): number;
    forecastedHealth(): number;

    // Events — engine subscribes
    // onReadyToAct emits the activation time (tick.value - chargePerTick) when CT maxes out.
    readonly onReadyToAct: Observable<number>;
    readonly onDied: Observable<void>;
    readonly onCtChanged: Observable<number>;

    // Animation surface — ActionFactory builds, AnimationComponent plays
    buildAnimation(key: string): Animation;
    buildAnimationFromDef(anim: InternalSheetAnimation, strategy?: AnimationStrategy): Animation;
    getSprite(col: number, row: number): Sprite;
    useAnimation(graphic: Graphic, next?: string | Graphic): Promise<void>;

    // Action lifecycle — engine drives, actor owns the flags
    beginAction(): void;
    endAction(action: StrategemAction): void;

    // Forecast — TargetStrategyComponent calls through here; ForecastComponent is private
    applyForecast(action: StrategemAction): void;

    // Hurt surface — DamageComponent calls through here; HurtComponent is private
    setHurtLock(lockerId: string): void;
    startHurt(damage: number): void;
    endHurt(damage: number): void;
    releaseHurtLock(lockerId: string): void;

    // Heal surface — RestoreComponent calls through here; HealedComponent is private
    setHealLock(lockerId: string): void;
    startHeal(health: number): void;
    endHeal(health: number): void;
    releaseHealLock(lockerId: string): void;
}
