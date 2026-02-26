import type { IBattleActor } from '@/game/actors/IBattleActor';
import { StrategemAction } from '@/game/actions/StrategemAction';
import { buildAction } from '@/game/actions/ActionFactory';
import { Strategem } from './Strategem';
import { useActionBus } from '@/state/useActionBus';
import { StrategemState } from '@/saveState/playerUnit/UnitStrategems';

// StrategemAgent is the strategem intelligence layer that wraps an IBattleActor.
// It owns: strategem list, intent evaluation, player input prompt, and the
// onReadyToAct subscription that drives action bus enqueueing.
//
// StrategemActor is the battle unit. StrategemAgent is the decision-maker.
// useActionBus works with StrategemAgent[], never with StrategemActor directly.
export class StrategemAgent {
    public readonly strategems: Strategem[] = [];

    // Optional: set by host game to draw an arc line before action executes.
    // Called with the resolved Promise<void> which is awaited by StrategemAction.execute().
    public pulseIntent?: () => Promise<void>;

    // Optional: set by host game to handle player input for party agents.
    // Must resolve to a StrategemAction that will be executed directly (not via strategems[]).
    private promptFn: (() => Promise<StrategemAction>) | null;

    constructor(
        public readonly actor: IBattleActor,
        definition: StrategemState[],
        promptFn: (() => Promise<StrategemAction>) | null = null,
    ) {
        this.promptFn = promptFn;

        // Subscribe to the actor's ready signal — enqueue when CT maxes out
        this.actor.onReadyToAct.subscribe((activationTime) =>
            this.onActorReady(activationTime),
        );

        // Build strategems from resolved definitions
        definition.forEach((def) => {
            const action = buildAction(this.actor, def.action, def.targetCondition);
            this.strategems.push(new Strategem(this.actor, def.conditionList, action));
        });
    }

    private onActorReady(activationTime: number) {
        const { isActionQueued, queueAction } = useActionBus();
        if (this.actor.isActing || this.actor.isDead() || isActionQueued(this)) return;
        queueAction(this, activationTime);
    }

    // Returns the first strategem whose conditions pass, or undefined.
    // Called by unqueueAction() on every dequeue — conditions may have changed since enqueueing.
    public getIntent(): Strategem | undefined {
        if (this.actor.isDead()) return undefined;
        for (const s of this.strategems) {
            if (s.checkActivation()) return s;
        }
        return undefined;
    }

    // Awaitable player input. The returned StrategemAction is executed directly by
    // unqueueAction() — it is never injected into strategems[].
    // promptFn is provided by the host game (e.g. wires up the hotbar UI).
    public promptAction(): Promise<StrategemAction> {
        if (!this.promptFn) {
            return Promise.reject(
                new Error(
                    `No promptFn provided for agent ${this.actor.actorId} (alignment: ${this.actor.alignment})`,
                ),
            );
        }
        return this.promptFn();
    }
}
