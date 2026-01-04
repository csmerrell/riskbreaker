// delete-db.js
import PouchDB from 'pouchdb';

const dbName = 'necrohell';
const db = new PouchDB(dbName);
db.destroy()
    .then(() => {
        console.log(`✅ Deleted database: ${dbName}`);
    })
    .catch((err) => {
        console.error(`❌ Failed to delete database "${dbName}":`, err);
    });
