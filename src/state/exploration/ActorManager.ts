import { Actor, Vector } from 'excalibur';
import { SceneManager } from '../SceneManager';
import type { ExplorationManager } from './ExplorationManager';
import type { CompositeActor } from '@/game/actors/CompositeActor/CompositeActor';

export type ActorCategory = 'player' | 'hostile' | 'neutral';

export interface ActorFilter {
    categories?: ActorCategory[];
    excludeCategories?: ActorCategory[];
}

// Placeholder for future movement strategy implementation
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MovementStrategy {
    // Will be defined when implementing movement strategies
}

export class ActorManager extends SceneManager {
    private players = new Set<CompositeActor>();
    private hostiles = new Set<Actor>();
    private neutrals = new Set<Actor>();
    private movementStrategies = new Map<Actor, MovementStrategy>(); // Stubbed for now

    constructor(private parent: ExplorationManager) {
        super({ scene: parent.scene });
    }

    public addPlayer(actor: CompositeActor): void {
        this.players.add(actor);
        this.scene.add(actor);
        this.scene.events.emit('actor:added', { actor, category: 'player' });
    }

    public addHostile(actor: Actor): void {
        this.hostiles.add(actor);
        this.scene.add(actor);
        this.scene.events.emit('actor:added', { actor, category: 'hostile' });
    }

    public addNeutral(actor: Actor): void {
        this.neutrals.add(actor);
        this.scene.add(actor);
        this.scene.events.emit('actor:added', { actor, category: 'neutral' });
    }

    public removeActor(actor: Actor): void {
        this.players.delete(actor as CompositeActor);
        this.hostiles.delete(actor);
        this.neutrals.delete(actor);
        this.detachMovementStrategy(actor);
        actor.kill();
        this.scene.remove(actor);
        this.scene.events.emit('actor:removed', { actor });
    }

    public getPlayers(): CompositeActor[] {
        return Array.from(this.players);
    }

    public getHostiles(): Actor[] {
        return Array.from(this.hostiles);
    }

    public getNeutrals(): Actor[] {
        return Array.from(this.neutrals);
    }

    public getAllActors(): Actor[] {
        return [...this.players, ...this.hostiles, ...this.neutrals];
    }

    public getActorCategory(actor: Actor): ActorCategory | undefined {
        if (this.players.has(actor as CompositeActor)) return 'player';
        if (this.hostiles.has(actor)) return 'hostile';
        if (this.neutrals.has(actor)) return 'neutral';
        return undefined;
    }

    public getActorsInRadius(pos: Vector, radius: number, filter?: ActorFilter): Actor[] {
        const actors = this.getAllActors();
        const inRadius = actors.filter((actor) => {
            const distance = actor.pos.distance(pos);
            return distance <= radius;
        });

        if (!filter) return inRadius;

        return inRadius.filter((actor) => {
            const category = this.getActorCategory(actor);
            if (!category) return false;

            if (filter.categories && !filter.categories.includes(category)) {
                return false;
            }

            if (filter.excludeCategories && filter.excludeCategories.includes(category)) {
                return false;
            }

            return true;
        });
    }

    // Stubbed movement strategy methods
    public attachMovementStrategy(actor: Actor, strategy: MovementStrategy): void {
        console.warn('ActorManager.attachMovementStrategy not yet implemented');
        this.movementStrategies.set(actor, strategy);
    }

    public detachMovementStrategy(actor: Actor): void {
        if (this.movementStrategies.has(actor)) {
            console.warn('ActorManager.detachMovementStrategy not yet implemented');
            this.movementStrategies.delete(actor);
        }
    }

    public getMovementStrategy(actor: Actor): MovementStrategy | undefined {
        return this.movementStrategies.get(actor);
    }

    public hideActors(filter?: ActorFilter): void {
        const actors = filter
            ? this.getActorsInRadius(this.scene.camera.pos, Infinity, filter)
            : this.getAllActors();

        actors.forEach((actor) => {
            actor.graphics.opacity = 0;
        });
    }

    public showActors(filter?: ActorFilter): void {
        const actors = filter
            ? this.getActorsInRadius(this.scene.camera.pos, Infinity, filter)
            : this.getAllActors();

        actors.forEach((actor) => {
            actor.graphics.opacity = 1;
        });
    }

    public hideAllActors(): void {
        this.hideActors();
    }

    public showAllActors(): void {
        this.showActors();
    }
}
