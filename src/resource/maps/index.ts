import { TiledResource } from '@excaliburjs/plugin-tiled';

const maps = {
    test: new TiledResource('./maps/test/test.tmx', {
        useTilemapCameraStrategy: true,
    }),
};

export async function loadMap(key: keyof typeof maps) {
    await maps[key].load();
    return maps[key];
}
