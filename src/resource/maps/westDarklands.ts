import { TiledResource } from '@excaliburjs/plugin-tiled';
import { vec } from 'excalibur';
import { MapMeta } from './maps';

const westDarklandsResources = {
    westDarklands: {
        type: 'region',
        key: 'westDarklands',
        name: 'Western Darklands',
        startPos: vec(18, 12),
        map: new TiledResource('./maps/all/westDarklands.tmx', {
            useTilemapCameraStrategy: true,
        }),
        keyPoints: {
            ...['6_6', '18_12', '25_17'].reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: { type: 'bonfire' },
                }),
                {},
            ),
            '17_10': {
                type: 'scriptTrigger',
                scriptName: 'unique.newGameFirstBattle',
            },
            '20_9': {
                type: 'scriptTrigger',
                scriptName: 'unique.newGameDragonAttack',
            },
        },
    },
} as const satisfies Record<string, MapMeta>;

export const resources = westDarklandsResources satisfies Record<
    keyof typeof westDarklandsResources,
    MapMeta & { key: keyof typeof westDarklandsResources }
>;
