import { TiledResource } from '@excaliburjs/plugin-tiled';
import { vec } from 'excalibur';
import { MapMeta } from '@/state/useExploration';

export const resources: Record<string, MapMeta> = {
    thurala: {
        type: 'region',
        key: 'thurala',
        name: 'Thurala',
        startPos: vec(3, 9),
        map: new TiledResource('./maps/thurala/thurala.tmx', {
            useTilemapCameraStrategy: true,
        }),
        keyPoints: {
            '13_1': {
                type: 'subZone',
                key: 'someForest',
            },
            '7_15': {
                type: 'subZone',
                key: 'someCave',
            },
        },
    },
    someForest: {
        type: 'subZone',
        name: 'Some Forest',
        key: 'someForest',
        startPos: vec(7, 10),
        map: new TiledResource('./maps/thurala/someForest.tmx', {
            useTilemapCameraStrategy: true,
        }),
        keyPoints: {
            '7_11': {
                type: 'region',
                key: 'thurala',
                posOverride: vec(13, 2),
            },
        },
    },
    someCave: {
        type: 'subZone',
        name: 'Some Cave',
        key: 'someCave',
        startPos: vec(15, 10),
        map: new TiledResource('./maps/thurala/someCave.tmx', {
            useTilemapCameraStrategy: true,
        }),
        keyPoints: {
            '15_11': {
                type: 'region',
                key: 'thurala',
                posOverride: vec(7, 16),
            },
        },
    },
};
