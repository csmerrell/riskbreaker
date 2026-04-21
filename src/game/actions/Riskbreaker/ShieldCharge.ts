import { TargetComponent } from '../TargetComponent';
import { Skill } from '../Skill';
import { Actor, EasingFunctions, vec } from 'excalibur';
import { useGameContext } from '@/state/useGameContext';
import { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';
import { useBattle } from '@/state/battle/useBattle';
import { useShader } from '@/state/useShader';
import { VFXLayer } from '@/game/actors/CompositeActor/VFXLayer';
import { moveAlongBezier } from '@/lib/helpers/movement.helper';
import { HealthComponent } from '@/game/actors/Battle/Health.component';

export class ShieldChargeSkill extends Skill {
    private ctCost: number = 80;
    private potency: number = 10;

    constructor() {
        super();
        this.addComponent(
            new TargetComponent({
                targetPriority: 'enemy',
                targetTypes: ['enemy'],
                areaType: 'single',
            }),
        );
    }

    public async activate() {
        const battleManager = useBattle().getBattleManager();

        //get key references;
        const actor = this.getActiveActor() as CompositeActor;
        const { targets, midPoint, z, maxDimensions } = await this.getTargets();

        //pre-activate
        const returnPoint = actor.pos.clone();
        const focusActor = new Actor({ pos: midPoint, z });
        battleManager.scene.add(focusActor);
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 100);
        });
        await Promise.all([actor.preActivateShimmer('shieldForward'), actor.useVFX('radialDust')]);
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 100);
        });

        //charge forward
        actor.useAnimation('shieldForward');
        const movementDuration = 250;
        await actor.actions
            .moveTo({
                pos: midPoint,
                duration: movementDuration,
                easing: EasingFunctions.EaseInCubic,
            })
            .toPromise();

        //impact, screenshake, hitstop, apply damage
        const VFXImpact = new VFXLayer('forwardImpact', {
            offset: vec(maxDimensions.x * 0.8, maxDimensions.y * -0.2),
        });
        focusActor.addChild(VFXImpact);
        const impactPromises = Promise.all([
            ...targets.map((t) => {
                return t.get(HealthComponent).hurt(this.potency + ~~(Math.random() * 8 - 3));
            }),
            VFXImpact.animate(),
            actor.useAnimation('shieldSpreadForward'),
        ]);
        await new Promise<void>((resolve) => {
            setTimeout(async () => {
                await Promise.all([
                    impactPromises,
                    useGameContext().hitStop(),
                    battleManager.cameraManager!.directionalShake(focusActor.pos, { intensity: 2 }),
                    battleManager.cameraManager?.zoomShake(),
                ]);
                resolve();
            }, 0);
        });
        await Promise.all(
            targets.map((t) =>
                t.useAnimation('hurtEnd', {
                    next: 'idle',
                }),
            ),
        );
        targets.forEach((t) => useShader().removeBorder(t));
        actor.useAnimation('jumpBack');
        await moveAlongBezier(actor, returnPoint, { duration: movementDuration });
        focusActor.kill();
        actor.useAnimation('idle');

        const { turnManager } = battleManager;
        turnManager.endTurn(this.ctCost);
    }
}
