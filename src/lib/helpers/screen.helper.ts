import { useGameContext } from '@/state/useGameContext';
import { gameEnum } from '../enum/game.enum';
import { Vector } from 'excalibur';

export function getScale() {
    return Math.max(
        window.innerHeight / gameEnum.nativeHeight,
        window.innerWidth / gameEnum.nativeWidth,
    );
}

export function getScreenCoords(coordinates: Vector) {
    return useGameContext().game.value.worldToScreenCoordinates(coordinates).scale(getScale());
}
