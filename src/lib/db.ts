import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Gesture } from '@/lib/types';

const DB_NAME = 'SignSpeakDB';
const DB_VERSION = 1;
const STORE_NAME = 'gestures';

interface SignSpeakDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: Gesture;
  };
}

let dbPromise: Promise<IDBPDatabase<SignSpeakDB>> | null = null;

const getDB = () => {
  if (typeof window === 'undefined') {
    // This is a server-side render, IndexedDB is not available.
    // Return a mock object that doesn't perform any operations.
    const mockDb = {
      get: async () => undefined,
      getAll: async () => [],
      put: async () => '',
      delete: async () => {},
      clear: async () => {},
    };
    return Promise.resolve(mockDb as unknown as IDBPDatabase<SignSpeakDB>);
  }

  if (!dbPromise) {
    dbPromise = openDB<SignSpeakDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'label' });
        }
      },
    });
  }
  return dbPromise;
};

export const gestureDB = {
  async get(label: string) {
    const db = await getDB();
    return db.get(STORE_NAME, label);
  },
  async getAll() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },
  async add(gesture: Gesture) {
    const db = await getDB();
    return db.put(STORE_NAME, gesture);
  },
  async delete(label: string) {
    const db = await getDB();
    return db.delete(STORE_NAME, label);
  },
  async clear() {
    const db = await getDB();
    return db.clear(STORE_NAME);
  },
};
