import units from './units/index';
import actions from './actions/index';
import Pouch from 'pouchdb';

const db = new (PouchDB as typeof Pouch)('necrohell');

export type DocMetadata = {
    _id: string;
    data: unknown;
    _rev?: string;
};

export const dbRegistry: Record<string, unknown> = {};
export const allDocuments: DocMetadata[] = [...units, ...actions];
async function seedDataState() {
    for (const docMeta of allDocuments) {
        const doc: DocMetadata = {
            ...docMeta,
            _id: `_local/${docMeta._id}`,
        };
        try {
            const existingDoc = await db.get(doc._id);
            doc._rev = existingDoc._rev; // Ensure we update the correct revision
            await db.put(doc);
        } catch (_e) {
            await db.put(doc);
        }
        registerPath(docMeta._id);
    }
}

function registerPath(id: string, remainingPath?: string, currentBranch?: Record<string, unknown>) {
    const pathSplit = remainingPath ? remainingPath.split('/') : id.split('/');
    const next = pathSplit.shift();
    remainingPath = pathSplit.join('/');

    const branch = currentBranch ?? dbRegistry;
    if (remainingPath === '') {
        branch[next] = id;
    } else {
        if (!branch[next]) branch[next] = {} as Record<string, unknown>;
        registerPath(id, remainingPath, branch[next] as Record<string, unknown>);
    }
}

await seedDataState();
export default db;
