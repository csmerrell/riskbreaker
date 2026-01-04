import { gameEnum } from '../enum/game.enum';
import { vec } from 'excalibur';

export function getScale() {
    return Math.max(
        window.innerHeight / gameEnum.nativeHeight,
        window.innerWidth / gameEnum.nativeWidth,
    );
}

export function getGameCoords(coordinates: { x: number; y: number }) {
    const scale = getScale();

    // Translate DOM coordinates to game coordinates relative to (0,0)
    return vec(
        ~~((coordinates.x - window.innerWidth / 2) / scale),
        ~~((coordinates.y - window.innerHeight / 2) / scale),
    );
}
