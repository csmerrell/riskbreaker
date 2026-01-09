import { docManager } from '@/db';
import { maps } from '@/resource/maps';
import { makeState } from '@/state/Observable';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { vec, Vector } from 'excalibur';

type KeyPointZone = {
    type: 'region' | 'subZone' | 'city';
    key: keyof typeof maps;
    posOverride?: Vector;
};

type KeyPointInteraction = {
    type: 'interactable';
    onInteract: () => void;
};

type KeyPointType = 'region' | 'subZone' | 'modalScene' | 'city' | 'interactable';
export type KeyPointMeta = {
    type: KeyPointType;
} & (KeyPointZone | KeyPointInteraction);

export type MapMeta = {
    type: KeyPointType;
    key: keyof typeof maps;
    name: string;
    startPos: Vector;
    map: TiledResource;
    keyPoints: Record<string, KeyPointMeta>;
};

const ready = makeState<boolean>(false);

//saved state
const currentMap = makeState<MapMeta>();
const playerTileCoord = makeState<Vector>();

//temp state
const fadeOutEnd = makeState<boolean>(false);
const fadeInStart = makeState<boolean>(false);
const loaded = makeState<boolean>(false);

function setCurrentMap(key: keyof typeof maps, posOverride?: Vector) {
    currentMap.set(
        posOverride
            ? {
                  ...maps[key],
                  startPos: posOverride,
              }
            : maps[key],
    );
}

function isZoneChangePoint(point: KeyPointMeta): point is KeyPointZone {
    return !!point.type.match(/region|subZone|city/);
}

export type SavedExplorationState = {
    mapKey: string;
    playerCoord: Vector;
};

async function saveExplorationState() {
    const { x, y } = playerTileCoord.value;
    return docManager.upsert('_local/explorationState', {
        mapKey: currentMap.value.key,
        playerCoord: { x, y },
    });
}

async function loadExplorationState() {
    const state = await docManager.tryGet<SavedExplorationState>('_local/explorationState');
    if (state) {
        const { mapKey, playerCoord } = state;
        setCurrentMap(mapKey);

        const { x, y } = playerCoord;
        playerTileCoord.set(vec(x, y));
    }
}

export function useExploration() {
    return {
        ready,
        currentMap,
        playerTileCoord,
        fadeOutEnd,
        fadeInStart,
        loaded,
        loadExplorationState,
        saveExplorationState,
        isZoneChangePoint,
        setCurrentMap,
    };
}
