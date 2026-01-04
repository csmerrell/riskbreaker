import db, { allDocuments } from '@/db';

const docs: Record<string, unknown> = {};

let loaded = false;
export async function preloadDbAll() {
    await Promise.all(
        allDocuments.map((doc) => {
            const { _id } = doc;
            return db.get(`_local/${_id}`).then((docResult) => {
                docs[_id] = docResult.data;
            });
        }),
    );
    loaded = true;
}

export function useDb() {
    if (!loaded) throw new Error('db used before it was loaded');
    return {
        dbResource: docs,
    };
}
