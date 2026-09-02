import { isResource, resources } from '@/resource';
import { Resource } from 'excalibur';

async function loadAllSprites() {
    loadResources(resources.image.units);
    loadResources(resources.image.misc);
}

function loadResources(base: Record<string, Resource<unknown>> | unknown) {
    Object.values(base).forEach((src) => {
        if (isResource(src) && !src.isLoaded()) {
            src.load();
        } else if (typeof src === 'object') {
            loadResources(src);
        }
    });
}

export function useSprites() {
    return {
        loadAllSprites,
    };
}
