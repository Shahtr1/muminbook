import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../../constants/http';
import AppError from '../../utils/AppError';
import { getDbOrAssertCollection } from '../dbHelper';

// Helper to create a fake db with listCollections
function makeFakeDb(collectionNames: string[] = []) {
  return {
    listCollections: () => ({
      toArray: async () => collectionNames.map((name) => ({ name })),
    }),
    collection: (name: string) => ({ name }),
  };
}

describe('getDbOrAssertCollection', () => {
  beforeEach(() => {
    // reset the mongoose.connection.db before each test
    (mongoose.connection as any).db = undefined;
    vi.restoreAllMocks();
  });

  it('throws INTERNAL_SERVER_ERROR when mongoose.connection.db is not set', async () => {
    (mongoose.connection as any).db = undefined;

    await expect(getDbOrAssertCollection()).rejects.toBeInstanceOf(AppError);
    await expect(getDbOrAssertCollection()).rejects.toMatchObject({
      statusCode: INTERNAL_SERVER_ERROR,
    });
  });

  it('throws NOT_FOUND when collectionName is provided but does not exist', async () => {
    (mongoose.connection as any).db = makeFakeDb(['users', 'books']);

    await expect(getDbOrAssertCollection('quran')).rejects.toBeInstanceOf(
      AppError
    );
    await expect(getDbOrAssertCollection('quran')).rejects.toMatchObject({
      statusCode: NOT_FOUND,
    });
  });

  it('returns the db when no collectionName is provided and db exists', async () => {
    const fakeDb = makeFakeDb(['users']);
    (mongoose.connection as any).db = fakeDb as any;

    const db = await getDbOrAssertCollection();
    expect(db).toBe(fakeDb);
  });

  it('returns the db when collectionName exists (case-insensitive)', async () => {
    const fakeDb = makeFakeDb(['Quran', 'Users']);
    (mongoose.connection as any).db = fakeDb as any;

    const db = await getDbOrAssertCollection('quran');
    expect(db).toBe(fakeDb);
  });
});
