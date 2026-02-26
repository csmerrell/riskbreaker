import { Animation, AnimationStrategy } from 'excalibur';
import { StrategemAction, type StrategemActionComponent } from './StrategemAction';
import type { IBattleActor } from '@/game/actors/IBattleActor';

import { frameRange } from '@/lib/helpers/number.helper';
import { useClock } from '@/state/useClock';

import { DamageComponent } from './components/DamageComponent';
import { AnimationComponent } from './components/AnimationComponent';
import { TargetStrategyComponent } from './components/TargetStrategyComponent';
import { ProjectileComponent } from './components/ProjectileComponent';
import { RestoreComponent } from './components/RestoreComponent';

import {
    ActionMetadata,
    isDamageAction,
    isMeleeAction,
    isProjectileAction,
    isRestorativeAction,
    isStatusAction,
} from '@/db/actions/Action';
import { ConditionState } from '@/game/strategems/Condition';
import { getTargets } from '@/game/strategems/Targeting';

export function buildAction(
    owner: IBattleActor,
    definition: ActionMetadata,
    targetCondition: ConditionState,
): StrategemAction {
    const action = new StrategemAction({ owner, ctCost: definition.ctCost, name: definition.name });

    action.addComponent(getTargetStrategy(definition, targetCondition));
    action.addComponent(getAnimationComponent(definition, owner));
    action.addComponentList(getTypeComponents(definition));
    action.addComponentList(getRangeComponents(definition));

    return action;
}

function getAnimationComponent(definition: ActionMetadata, owner: IBattleActor) {
    const anim = new AnimationComponent();

    // buildAnimation goes through IBattleActor — spritesheet internals are private
    anim.setGraphicDuring(owner.buildAnimation(definition.executeAnimation));

    const { in: animIn, out: animOut } = definition.freezeFrames ?? {};
    if (animIn) {
        // getSprite goes through IBattleActor — sheet is private
        anim.setGraphicBefore(owner.getSprite(animIn.col, animIn.row));
    }
    if (animOut) {
        anim.setGraphicAfter(owner.getSprite(animOut.col, animOut.row));
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
        // todo
    }
    return components;
}

function getRangeComponents(definition: ActionMetadata): StrategemActionComponent[] {
    const components: StrategemActionComponent[] = [];
    // MovementComponent is host-game-specific and not part of the extracted engine.
    // Host games add their own movement component for melee actions if desired.
    if (isMeleeAction(definition)) {
        // No engine-level movement component for melee.
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
        return getTargets(targetCondition).slice(0, definition.targetCt);
    });
    return component;
}
