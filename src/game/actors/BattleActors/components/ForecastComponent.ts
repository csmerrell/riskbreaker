import { DamageComponent } from '@/game/actions/components/DamageComponent';
import { ActorComponent } from './Component';
import { RestoreComponent } from '@/game/actions/components/RestoreComponent';
import { HealthComponent } from './HealthComponent';
import { StrategemAction } from '@/game/actions/StrategemAction';

export class ForecastComponent extends ActorComponent {
    constructor() {
        super('Forecast');
    }

    public mutateTargetForecasts(action: StrategemAction) {
        const healthComp = this.owner.getComponent(HealthComponent);
        if (action.hasComponent(DamageComponent)) {
            const damageComp = action.getComponent(DamageComponent);
            let adjustedDamage = damageComp.potency;

            //todo - Factor in damage cover (ally takes the hit)
            //todo - Factor in damage reduction
            //todo - Factor in evasion
            //todo - Factor in reaction recovery
            if (Array.isArray(adjustedDamage)) {
                adjustedDamage = adjustedDamage.map((hit) => hit + 0);
            } else {
                adjustedDamage += 0;
            }

            damageComp.registerComputedDamage(this.owner.actorId, adjustedDamage);
            const damageSum = Array.isArray(damageComp.potency)
                ? damageComp.potency.reduce((sum, n) => (sum += n), 0)
                : damageComp.potency;

            healthComp.forecastDamage(damageSum);
        }
        if (action.hasComponent(RestoreComponent)) {
            const actionHealing = action.getComponent(RestoreComponent);

            //todo - Factor in heal bonuses
            //todo - Factor in reaction recovery

            const healingSum = Array.isArray(actionHealing.potency)
                ? actionHealing.potency.reduce((sum, n) => (sum += n), 0)
                : actionHealing.potency;

            healthComp.forecastRestoration(healingSum);
        }
    }
}
