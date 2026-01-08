import { resources as thuralaResources } from './thurala';

export const maps = {
    ...thuralaResources,
};

export async function loadMapAsync(key: keyof typeof maps) {
    return maps[key].map.load();
}

export async function loadMap(key: keyof typeof maps) {
    if (!maps[key].map.isLoaded()) {
        await maps[key].map.load();
    }
    return maps[key];
}
