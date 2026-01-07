import { TiledResource } from '@excaliburjs/plugin-tiled';
import { vec } from 'excalibur';
import { KeyPointMeta } from '@/ui/views/ExplorationView/useExploration';

export const resources = {
    thurala: new TiledResource('./maps/thurala/thurala.tmx', {
        useTilemapCameraStrategy: true,
    }),
    someForest: new TiledResource('./maps/thurala/someForest.tmx', {
        useTilemapCameraStrategy: true,
    }),
};

export function useThuralaRegion() {
    const map = resources.thurala;
    const keyPoints: Record<string, KeyPointMeta> = {
        13_1: {
            type: 'subZone',
            name: 'Some Forest',
            map: resources.someForest,
        },
    };
    return {
        map,
        keyPoints,
        startPos: vec(3, 9),
    };
}
