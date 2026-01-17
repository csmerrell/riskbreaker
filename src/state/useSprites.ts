import { resources } from '@/resource';

async function loadAllSprites() {
    [...Object.values(resources.image.units), ...Object.values(resources.image.misc)].forEach(
        (spriteResource) => {
            if (!spriteResource.isLoaded()) {
                spriteResource.load();
            }
        },
    );
}

export function useSprites() {
    return {
        loadAllSprites,
    };
}
