//core
import { Animation, AnimationStrategy } from 'excalibur';
import { StrategemAction, type StrategemActionComponent } from './StrategemAction';
import type { StrategemActor } from '../actors/StrategemActor/StrategemActor';

//lib
import { frameRange } from '@/lib/helpers/number.helper';

//state
import { useClock } from '@/state/deprecated/useClock';

//action components
import { DamageComponent } from './components/DamageComponent';
import { MovementComponent } from './components/MovementComponent';
import { AnimationComponent } from './components/AnimationComponent';
import { TargetStrategyComponent } from './components/TargetStrategyComponent';
import { ProjectileComponent } from './components/ProjectileComponent';

//types
import {
    ActionMetadata,
    isDamageAction,
    isMeleeAction,
    isProjectileAction,
    isRestorativeAction,
    isStatusAction,
} from '@/db/actions/Action';
import { ConditionState } from '../strategems/Condition';
import { getTargets } from '../strategems/Targeting';
import { RestoreComponent } from './components/RestoreComponent';

export function buildAction(
    owner: StrategemActor,
    definition: ActionMetadata,
    targetCondition: ConditionState,
): StrategemAction {
    const action = new StrategemAction({ owner, ctCost: definition.ctCost, name: definition.name });

    action.addComponent(getTargetStrategy(definition, targetCondition));
    action.addComponent(getAnimationComponent(definition, owner));
    action.addComponentList(getTypeComponents(definition));
    action.addComponentList(getRangeComponents(definition, owner));

    return action;
}

function getAnimationComponent(definition: ActionMetadata, owner: StrategemActor) {
    const anim = new AnimationComponent();
    const { numCols } = owner.unitDef.spriteSheet;
    const animationDef = owner.unitDef.animations[definition.executeAnimation];
    const { clockSpeed } = useClock();
    anim.setGraphicDuring(
        Animation.fromSpriteSheet(
            owner.sheet,
            frameRange(numCols, animationDef),
            clockSpeed.clockMs.value * animationDef.frameDuration,
            AnimationStrategy.Freeze,
        ),
    );
    const { in: animIn, out: animOut } = definition.freezeFrames ?? {};
    if (animIn) {
        anim.setGraphicBefore(owner.sheet.getSprite(animIn.col, animIn.row));
    }
    if (animOut) {
        anim.setGraphicAfter(owner.sheet.getSprite(animOut.col, animOut.row));
    }

    return anim;
}

function getTypeComponents(definition: ActionMetadata): StrategemActionComponent[] {
    const components: StrategemActionComponent[] = [];
    if (isDamageAction(definition)) {
        const damageComponent = new DamageComponent();
        damageComponent.setPotency(definition.potency);
        damageComponent.setHurtFrames(definition.hurtFrames);
        components.push(damageComponent);
    } else if (isRestorativeAction(definition)) {
        const restoreComponent = new RestoreComponent();
        restoreComponent.setPotency(definition.potency);
        restoreComponent.setHealFrames(definition.healFrames);
        components.push(restoreComponent);
    } else if (isStatusAction(definition)) {
    }
    return components;
}

function getRangeComponents(
    definition: ActionMetadata,
    owner: StrategemActor,
): StrategemActionComponent[] {
    const components: StrategemActionComponent[] = [];
    if (isMeleeAction(definition)) {
        const movementComponent = new MovementComponent('toTarget', {
            xOffset: owner.alignment === 'party' ? -20 : 20,
        });
        components.push(movementComponent);
    } else if (isProjectileAction(definition)) {
        const projectileComponent = new ProjectileComponent(definition);
        components.push(projectileComponent);
    }
    return components;
}

function getTargetStrategy(
    definition: ActionMetadata,
    targetCondition: ConditionState,
): TargetStrategyComponent {
    const component = new TargetStrategyComponent();
    component.setTargetStrategy(() => {
        const targets = getTargets(targetCondition)
            .map((t) => t.actor)
            .slice(0, definition.targetCt);
        return targets;
    });

    return component;
}
