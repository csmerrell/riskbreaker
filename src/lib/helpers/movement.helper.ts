import * as ex from 'excalibur';
import { Vector } from 'excalibur';

const TIME_TO_WALK_TILE = 1000;
const TIME_TO_RUN_TILE = 400;
const TILE_LENGTH = 24;

export function getTimeToDestination_Walk(start: Vector, dest: Vector) {
    const dist = start.distance(dest);
    return (dist / TILE_LENGTH) * TIME_TO_WALK_TILE;
}

export function getTimeToDestination_Run(start: Vector, dest: Vector) {
    const dist = start.distance(dest);
    return (dist / TILE_LENGTH) * TIME_TO_RUN_TILE;
}

/**
 * Moves an actor along a bezier curve to a destination
 * @param actor - The actor to move
 * @param destination - The target position
 * @param opts - Movement options
 * @param opts.duration - Total duration of the movement in milliseconds
 * @param opts.amplitude - Height of the arc (default: 12.5)
 * @returns Promise that resolves when the actor reaches the destination
 */
export async function moveAlongBezier(
    actor: ex.Actor,
    destination: ex.Vector,
    opts: {
        duration: number;
        amplitude?: number;
    },
): Promise<void> {
    const amplitude = opts.amplitude ?? 12.5;
    const start = actor.pos.clone();

    // Create bezier curve with control points matching ArcLine pattern
    const control1 = ex.vec(start.x + (destination.x - start.x) / 4, start.y - amplitude);
    const control2 = ex.vec(
        start.x + (3 * (destination.x - start.x)) / 4,
        destination.y - amplitude,
    );

    const curve = new ex.BezierCurve({
        controlPoints: [start, control1, control2, destination],
    });

    const startTime = Date.now();

    return new Promise<void>((resolve) => {
        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / opts.duration, 1);

            actor.pos = curve.getPoint(progress);

            if (progress >= 1) {
                actor.pos = destination;
                resolve();
            } else {
                requestAnimationFrame(update);
            }
        };
        update();
    });
}
