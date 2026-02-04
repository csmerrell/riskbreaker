import { TiledResource } from '@excaliburjs/plugin-tiled';
import { vec } from 'excalibur';
import { MapMeta } from './maps';

const introResources = {
    intro: {
        type: 'region',
        key: 'intro',
        name: 'Intro',
        startPos: vec(19, 14),
        map: new TiledResource('./maps/all/intro.tmx', {
            useTilemapCameraStrategy: true,
        }),
        keyPoints: {
            ...['6_6', '19_14'].reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: { type: 'bonfire' },
                }),
                {},
            ),
        },
    },
} as const satisfies Record<string, MapMeta>;

export const resources = introResources satisfies Record<
    keyof typeof introResources,
    MapMeta & { key: keyof typeof introResources }
>;
