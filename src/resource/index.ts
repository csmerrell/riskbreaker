import { Loadable, Resource } from 'excalibur';
import image from './image';
import { maps } from './maps';

export const resources = {
    image,
};

export function isResource(obj: unknown): obj is Resource<unknown> {
    return (obj as Resource<unknown>)?.bustCache !== undefined;
}

export function loadAllResources(root: Record<string, unknown | Loadable<unknown>>) {
    Object.values(root).forEach((v) => {
        if (isResource(v)) {
            v.load();
        } else if (typeof v === 'object' && Object.keys(v).length > 0) {
            loadAllResources(v as Record<string, unknown | Loadable<unknown>>);
        }
    });
}

export function loadAllMaps() {
    Object.keys(maps).forEach((key: keyof typeof maps) => {
        maps[key].map.load();
    });
}
