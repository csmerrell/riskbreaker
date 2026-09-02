import { Loadable, Resource } from 'excalibur';
import image from './image';
import { maps } from './maps';

export const resources = {
    image,
};

export function isResource(obj: unknown): obj is Resource<unknown> {
    return (obj as Resource<unknown>)?.bustCache !== undefined;
}

export async function loadAllResources(
    root: Record<string, unknown | Loadable<unknown>>,
): Promise<unknown> {
    return Object.values(root).reduce((acc: Promise<unknown>, v) => {
        if (isResource(v)) {
            return Promise.all([acc, v.load()]);
        } else if (typeof v === 'object' && Object.keys(v).length > 0) {
            return Promise.all([
                acc,
                loadAllResources(v as Record<string, unknown | Loadable<unknown>>),
            ]);
        }
        return acc;
    }, []);
}

export async function loadAllMaps() {
    await Promise.all(
        Object.keys(maps).map(async (key: keyof typeof maps) => {
            return maps[key].map.load();
        }),
    );
}
