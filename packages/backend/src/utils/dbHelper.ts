import mongoose from 'mongoose';
import type { Db } from 'mongodb';
import appAssert from './appAssert.js';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '../constants/http.js';

/**
 * Returns:
 *  - connected Db instance
 *  - normalized collection name (if provided)
 */
export async function getDbOrAssertCollection(
  collectionName?: string
): Promise<{ db: Db; collectionName?: string }> {
  const db = mongoose.connection.db as Db | undefined;

  appAssert(db, INTERNAL_SERVER_ERROR, 'Database not connected');

  if (!collectionName) {
    return { db };
  }

  // Normalize collection name (convert dash to underscore)
  const normalizedName = collectionName.replace(/-/g, '_');

  const collections = await db.listCollections().toArray();

  const exists = collections.some(
    (col) => col.name.toLowerCase() === normalizedName.toLowerCase()
  );

  appAssert(exists, NOT_FOUND, `Data of '${normalizedName}' not found.`);

  return { db, collectionName: normalizedName };
}
