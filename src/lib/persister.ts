import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * Creates an Indexed DB persister calling idb-keyval underneath.
 * This allows storing the React Query cache indefinitely in the browser's IndexedDB.
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery'): Persister {
    return {
        persistClient: async (client: PersistedClient) => {
            await set(idbValidKey, client);
        },
        restoreClient: async () => {
            return await get<PersistedClient>(idbValidKey);
        },
        removeClient: async () => {
            await del(idbValidKey);
        },
    };
}

export const persister = createIDBPersister();
