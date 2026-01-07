import { resources as thuralaResources } from './thurala';

export const maps = {
    ...thuralaResources,
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
