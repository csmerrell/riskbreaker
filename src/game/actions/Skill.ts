import { BattleActor, useBattle } from '@/state/battle/useBattle';
import { Entity, vec, Vector } from 'excalibur';
import { TargetComponent } from './TargetComponent';

export class Skill extends Entity {
    protected getActiveActor(): BattleActor {
        const battleManager = useBattle().getBattleManager();
        const unit = battleManager.turnManager.activeUnit.value!;
        const actor = (
            Object.values(battleManager.laneUnitMap).flatMap((a) => a) as BattleActor[]
        ).find((a) => a.unitId === unit.id);
        if (!actor) {
            throw new Error(
                `Actor for unit id [${unit.id}] not found in Skill.activate.\n
                Should not be possible, as unit is derived from active unit, which is pre-requisite to this event firing.`,
            );
        }
        return actor;
    }

    protected async getTargets(): Promise<{
        targets: BattleActor[];
        midPoint: Vector;
        z: number;
        maxDimensions: Vector;
    }> {
        const targetLane = await this.get(TargetComponent).promptTarget();
        const battleManager = useBattle().getBattleManager();
        const targets = battleManager.laneUnitMap[targetLane];

        const maxDimensions = vec(0, 0);
        let midPoint = vec(0, 0);
        let z = 0;

        targets.forEach((t) => {
            maxDimensions.x = Math.max(maxDimensions.x, t.getDimensions().spriteWidth);
            maxDimensions.y = Math.max(maxDimensions.y, t.getDimensions().spriteHeight);
            midPoint = midPoint.add(t.pos.add(t.hitPointOffset));
            z = Math.max(z, t.z + 1);
        });

        //get midpoint
        return {
            targets,
            midPoint,
            maxDimensions,
            z,
        };
    }

    public async activate(): Promise<void> {
        throw new Error(
            'Generic skill.activate was called. It must be implemented by the inheriting class.',
        );
    }
}
