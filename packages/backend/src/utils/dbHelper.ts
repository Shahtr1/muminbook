import mongoose from 'mongoose';
import type { Db } from 'mongodb';
import appAssert from './appAssert';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http';

/**
 * Return the connected MongoDB `Db` instance and optionally assert a collection exists.
 * Throws using appAssert when the DB is not available or the collection is missing.
 */
export async function getDbOrAssertCollection(
  collectionName?: string
): Promise<Db> {
  const db = (mongoose.connection as any).db as Db | undefined;
  appAssert(db, INTERNAL_SERVER_ERROR, 'Database not connected');

  if (!collectionName) return db as Db;

  const collections = await db!.listCollections().toArray();
  const collectionExists = collections.some(
    (col) => col.name.toLowerCase() === collectionName.toLowerCase()
  );
  appAssert(
    collectionExists,
    NOT_FOUND,
    `Data of '${collectionName}' not found.`
  );

  return db as Db;
}
