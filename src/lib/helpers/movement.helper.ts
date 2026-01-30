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
