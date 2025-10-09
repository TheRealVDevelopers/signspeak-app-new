import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Gesture, Sentence } from '@/lib/types';

const DB_NAME = 'SignSpeakDB';
const DB_VERSION = 2; // Incremented version for schema change
const GESTURE_STORE_NAME = 'gestures';
const SENTENCE_STORE_NAME = 'sentences';

interface SignSpeakDB extends DBSchema {
  [GESTURE_STORE_NAME]: {
    key: string;
    value: Gesture;
  };
  [SENTENCE_STORE_NAME]: {
    key: string;
    value: Sentence;
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
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
            if (!db.objectStoreNames.contains(GESTURE_STORE_NAME)) {
                db.createObjectStore(GESTURE_STORE_NAME, { keyPath: 'label' });
            }
        }
        if (oldVersion < 2) {
            if (!db.objectStoreNames.contains(SENTENCE_STORE_NAME)) {
                db.createObjectStore(SENTENCE_STORE_NAME, { keyPath: 'label' });
            }
        }
      },
    });
  }
  return dbPromise;
};

export const gestureDB = {
  async get(label: string) {
    const db = await getDB();
    return db.get(GESTURE_STORE_NAME, label);
  },
  async getAll() {
    const db = await getDB();
    return db.getAll(GESTURE_STORE_NAME);
  },
  async add(gesture: Gesture) {
    const db = await getDB();
    const gestureWithType = { ...gesture, type: gesture.type || 'word' as const };
    return db.put(GESTURE_STORE_NAME, gestureWithType);
  },
  async delete(label: string) {
    const db = await getDB();
    return db.delete(GESTURE_STORE_NAME, label);
  },
  async clear() {
    const db = await getDB();
    return db.clear(GESTURE_STORE_NAME);
  },
};

export const sentenceDB = {
    async get(label: string) {
      const db = await getDB();
      return db.get(SENTENCE_STORE_NAME, label);
    },
    async getAll() {
      const db = await getDB();
      return db.getAll(SENTENCE_STORE_NAME);
    },
    async add(sentence: Sentence) {
      const db = await getDB();
      return db.put(SENTENCE_STORE_NAME, sentence);
    },
    async delete(label: string) {
      const db = await getDB();
      return db.delete(SENTENCE_STORE_NAME, label);
    },
    async clear() {
      const db = await getDB();
      return db.clear(SENTENCE_STORE_NAME);
    },
  };
