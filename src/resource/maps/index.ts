import { vec, Vector } from 'excalibur';
import { KeyPointBase, KeyPointMeta, KeyPointType, MapMeta, ZoneOmittedKeyPoint } from './maps';
import { resources as thuralaResources } from './thurala';
import { useGameContext } from '@/state/useGameContext';
import { useExploration } from '@/state/useExploration';

export const allMaps = {
    ...thuralaResources,
} satisfies Record<string, MapMeta>;

export const maps = allMaps satisfies Record<
    keyof typeof allMaps,
    Omit<MapMeta, 'keyPoints'> & {
        keyPoints: Record<
            string,
            { type: KeyPointType } & (
                | ZoneOmittedKeyPoint
                | {
                      type: 'region' | 'subZone' | 'city';
                      key: keyof typeof allMaps;
                      posOverride?: Vector;
                  }
            )
        >;
    }
>;

export function isZoneChangePoint(point: KeyPointMeta): point is {
    type: 'region' | 'subZone' | 'city';
    key: keyof typeof allMaps;
    posOverride?: Vector;
} {
    return !!point.type.match(/region|subZone|city/);
}

export function isBonfire(point: KeyPointMeta): point is KeyPointBase {
    return point.type === 'bonfire';
}

export function isHaltingKeypoint(point: KeyPointMeta) {
    return isBonfire(point) || isZoneChangePoint(point);
}

export function getTileCoords(key: string) {
    const [x, y] = key.split('_').map((p) => Number(p));
    return vec(x, y);
}

export function getTileCenter(key: string) {
    const engine = useGameContext().game.value;
    const map = useExploration().currentMap.value.map.map;
    const coord = getTileCoords(key);
    return engine
        .worldToScreenCoordinates(coord.scale(map.tilewidth))
        .add(vec(map.tilewidth / 2, map.tilewidth / 2 - 4));
}

export function getTileCenter_Raw(key: string) {
    const map = useExploration().currentMap.value.map.map;
    const coord = getTileCoords(key);
    return coord.scale(map.tilewidth).add(vec(0, -2));
}

export async function loadMapAsync(key: keyof typeof maps) {
    return maps[key].map.load();
}

export async function loadMap(key: keyof typeof maps) {
    if (!maps[key].map.isLoaded()) {
        await maps[key].map.load();
    }
    return maps[key];
}
