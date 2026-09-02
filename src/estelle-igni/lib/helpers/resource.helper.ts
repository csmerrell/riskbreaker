import { resources } from '@/resource';
import { Loadable, Resource } from 'excalibur';

export function getSourceMap(obj: object): Record<string, Resource<unknown>> {
    const result: Record<string, Resource<unknown>> = {};

    function recurse(value: unknown): void {
        if (Array.isArray(value)) {
            for (const item of value) {
                recurse(item);
            }
        } else if (value && typeof value === 'object') {
            for (const [key, val] of Object.entries(value)) {
                if (key === 'sourceName' && typeof val === 'string') {
                    result[val] = findResource(val);
                } else {
                    recurse(val);
                }
            }
        }
    }

    recurse(obj);
    return result;
}

function findResource(sourceName: string) {
    const path = sourceName.split('/');
    let resource = resources;
    let validPath: string = '';
    while (path.length > 0) {
        try {
            const p = path.shift();
            //@ts-expect-error resource isn't typed for dynamic crawling, but this takes necessary precautions.
            resource = resource[p];
            validPath = `${validPath}${p}/`;
        } catch (_e: unknown) {
            throw new Error(
                `Error retrieving resource. [${sourceName}]\n\nPath was valid up to: [${validPath}]`,
            );
        }
    }

    return resource as unknown as Resource<unknown>;
}

export function injectSources<T>(obj: T, mappedSources: Record<string, Loadable<unknown>>): T {
    function recurse(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map(recurse);
        }

        if (value && typeof value === 'object') {
            const entries = Object.entries(value);
            let hasSourceName = false;
            let sourceKey = '';

            // Create a new object to avoid mutation
            const newObj: Record<string, unknown> = {};

            for (const [key, val] of entries) {
                if (key === 'sourceName' && typeof val === 'string') {
                    hasSourceName = true;
                    sourceKey = val;
                    newObj[key] = val;
                } else {
                    newObj[key] = recurse(val);
                }
            }

            if (hasSourceName && sourceKey in mappedSources) {
                newObj['source'] = mappedSources[sourceKey];
            }

            return newObj;
        }

        return value;
    }

    return recurse({ ...obj }) as T;
}
