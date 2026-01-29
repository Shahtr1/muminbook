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

  it('throws NOT_FOUND when collectionName does not exist', async () => {
    (mongoose.connection as any).db = makeFakeDb(['users', 'books']);

    await expect(getDbOrAssertCollection('quran')).rejects.toBeInstanceOf(
      AppError
    );

    await expect(getDbOrAssertCollection('quran')).rejects.toMatchObject({
      statusCode: NOT_FOUND,
    });
  });

  it('returns the db when no collectionName is provided', async () => {
    const fakeDb = makeFakeDb(['users']);
    (mongoose.connection as any).db = fakeDb as any;

    const result = await getDbOrAssertCollection();

    expect(result.db).toBe(fakeDb);
    expect(result.collectionName).toBeUndefined();
  });

  it('returns db and normalized collectionName when collection exists (case-insensitive)', async () => {
    const fakeDb = makeFakeDb(['Quran', 'Users']);
    (mongoose.connection as any).db = fakeDb as any;

    const result = await getDbOrAssertCollection('quran');

    expect(result.db).toBe(fakeDb);
    expect(result.collectionName).toBe('quran');
  });

  it('normalizes dashes to underscores', async () => {
    const fakeDb = makeFakeDb(['my_collection']);
    (mongoose.connection as any).db = fakeDb as any;

    const result = await getDbOrAssertCollection('my-collection');

    expect(result.collectionName).toBe('my_collection');
  });
});
