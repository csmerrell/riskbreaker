import { resources } from '@/resource';

async function loadAllSprites() {
    Object.values(resources.image.units).forEach((spriteResource) => {
        if (!spriteResource.isLoaded()) {
            spriteResource.load();
        }
    });
}

export function usePlayerSprites() {
    return {
        loadAllSprites,
    };
}
