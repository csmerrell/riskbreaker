import { TiledResource } from '@excaliburjs/plugin-tiled';

export const maps = {
    test: new TiledResource('./maps/test/test.tmx', {
        useTilemapCameraStrategy: true,
    }),
};

export async function loadMapAsync(key: keyof typeof maps) {
    return maps[key].load();
}

export async function loadMap(key: keyof typeof maps) {
    if (!maps[key].isLoaded()) {
        await maps[key].load();
    }
    return maps[key];
}
