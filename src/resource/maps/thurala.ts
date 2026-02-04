import { TiledResource } from '@excaliburjs/plugin-tiled';
import { vec } from 'excalibur';
import { MapMeta } from './maps';

const thuralaResources = {
    thurala: {
        type: 'region',
        key: 'thurala',
        name: 'Thurala',
        startPos: vec(2, 11),
        map: new TiledResource('./maps/all/thurala.tmx', {
            useTilemapCameraStrategy: true,
        }),
        keyPoints: {
            '2_9': {
                type: 'lightSource',
                radius: 6,
                offset: vec(12, 12),
            },
            '13_1': {
                type: 'subZone',
                key: 'someForest',
            },
            '7_15': {
                type: 'subZone',
                key: 'someCave',
            },
            ...['13_3', '16_1', '23_1', '22_13', '28_18', '28_1'].reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: { type: 'bonfire' },
                }),
                {},
            ),
        },
    },
    someForest: {
        type: 'subZone',
        name: 'Some Forest',
        key: 'someForest',
        startPos: vec(7, 10),
        map: new TiledResource('./maps/all/someForest.tmx', {
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
        map: new TiledResource('./maps/all/someCave.tmx', {
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
} as const satisfies Record<string, MapMeta>;

export const resources = thuralaResources satisfies Record<
    keyof typeof thuralaResources,
    MapMeta & { key: keyof typeof thuralaResources }
>;
