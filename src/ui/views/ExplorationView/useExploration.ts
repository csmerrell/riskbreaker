import { maps } from '@/resource/maps';
import { useThuralaRegion } from '@/resource/maps/thurala';
import { makeState } from '@/state/Observable';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { TileMap, Vector } from 'excalibur';

type KeyPointZone = {
    type: 'subZone' | 'city' | 'modalScene';
    name: string;
    map: TiledResource;
};

type KeyPointInteraction = {
    type: 'interactable';
    onInteract: () => void;
};

export type KeyPointMeta = {
    type: 'subZone' | 'interactable';
} & (KeyPointZone | KeyPointInteraction);

export type MapMeta = {
    key: keyof typeof maps;
    startPos: Vector;
    map: TiledResource;
    keyPoints: Record<string, KeyPointMeta>;
};

const ready = makeState<boolean>(false);
const currentMap = makeState<MapMeta>();

function setCurrentMap(key: keyof typeof maps) {
    switch (key) {
        case 'thurala':
            currentMap.set({
                key,
                ...useThuralaRegion(),
            });
            break;
        default:
            console.warn(`Attempted to use unknown map key: [${key}]`);
    }
}

export function useExploration() {
    return {
        ready,
        currentMap,
        setCurrentMap,
    };
}
