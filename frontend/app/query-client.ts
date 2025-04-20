import { QueryClient } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  type Persister,
} from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'OpenLatexAIDB';
const STORE_NAME = 'queryCache';

async function getIDBP(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

export const indexedDBPersister = createAsyncStoragePersister({
    storage: {
        getItem: async (key) => {
            const db = await getIDBP();
            const value = await db.get(STORE_NAME, key);
            return value === undefined ? null : value;
        },
        setItem: async (key, value) => {
            const db = await getIDBP();
            await db.put(STORE_NAME, value, key);
        },
        removeItem: async (key) => {
            const db = await getIDBP();
            await db.delete(STORE_NAME, key);
        },
    },
    throttleTime: 1000,
});


export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24,
            staleTime: 0,
            refetchInterval: 60000,
        },
    },
});

