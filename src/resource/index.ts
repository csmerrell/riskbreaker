import { Resource } from 'excalibur';
import image from './image';

export const resources = {
    image,
};

export function isResource(obj: unknown): obj is Resource<unknown> {
    return (obj as Resource<unknown>)?.bustCache !== undefined;
}
