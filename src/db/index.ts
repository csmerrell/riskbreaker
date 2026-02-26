import Pouch from 'pouchdb';

const db = new (PouchDB as typeof Pouch)('riskbreaker');

export type DocMetadata = {
    _id: string;
    data: unknown;
    _rev?: string;
};

class DocumentManager {
    private revCache: Map<string, string> = new Map();
    private db: PouchDB.Database;

    constructor(database: PouchDB.Database) {
        this.db = database;
    }

    // Load document and cache its _rev
    async get<T>(id: string) {
        const doc = (await this.db.get(id)) as DocMetadata & { data: T };
        this.revCache.set(id, doc._rev!);
        return doc.data;
    }

    // Update using cached _rev
    async put(id: string, data: unknown) {
        const cachedRev = this.revCache.get(id);

        const doc: DocMetadata = {
            _id: id,
            data: data,
        };

        if (cachedRev) {
            doc._rev = cachedRev;
        }

        try {
            const result = await this.db.put(doc);
            // Update cache with new revision
            this.revCache.set(id, result.rev);
            return result;
        } catch (error: unknown) {
            // If revision conflict, refresh and retry
            if (
                error &&
                typeof error === 'object' &&
                'name' in error &&
                error.name === 'conflict'
            ) {
                const freshDoc = await this.db.get(id);
                this.revCache.set(id, freshDoc._rev!);
                doc._rev = freshDoc._rev;
                const result = await this.db.put(doc);
                this.revCache.set(id, result.rev);
                return result;
            }
            throw error;
        }
    }

    // Create new document (no _rev needed)
    async create(id: string, data: unknown) {
        const result = await this.db.put({
            _id: id,
            data: data,
        });
        this.revCache.set(id, result.rev);
        return result;
    }

    // Smart upsert - create if doesn't exist, update if it does
    async upsert(id: string, data: unknown) {
        try {
            return await this.put(id, data);
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'name' in error &&
                error.name === 'not_found'
            ) {
                return await this.create(id, data);
            }
            throw error;
        }
    }

    // Safe get - returns null if document doesn't exist
    async tryGet<T>(id: string): Promise<T | null> {
        try {
            return (await this.get(id)) as T;
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'name' in error &&
                error.name === 'not_found'
            ) {
                return null;
            }
            throw error;
        }
    }
}

const docManager = new DocumentManager(db);

export const dbRegistry: Record<string, unknown> = {};
export const allDocuments: DocMetadata[] = [];
async function seedDataState() {
    for (const docMeta of allDocuments) {
        const localId = `_local/${docMeta._id}`;

        try {
            // Try to load existing (caches _rev automatically)
            await docManager.get(localId);
            // Update with cached _rev
            await docManager.put(localId, docMeta.data);
        } catch (_e) {
            // Create new document
            await docManager.create(localId, docMeta.data);
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
export { docManager };
export default db;
