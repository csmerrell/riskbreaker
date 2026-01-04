export type ComponentConstructor<T = unknown> = new (...args: unknown[]) => T;

export type PropertiesOf<T> = {
    [K in keyof T]: T[K];
};

export type OmitActionsAndPromises<T> = {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T as T[K] extends ((...args: any[]) => any) | Promise<any> ? never : K]: T[K];
};

export type PrimitivesOf<T> = OmitActionsAndPromises<PropertiesOf<T>>;

export function TypedKeys<T>(obj: T) {
    return Object.keys(obj) as (keyof T)[];
}
