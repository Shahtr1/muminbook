import mongoose from "mongoose";
import QuranModel from "../../models/quran.model";
import appAssert from "../../utils/appAssert";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../../constants/http";

export const getReading = async (id: string, query: any = {}) => {
  const db = mongoose.connection.db;
  appAssert(db, INTERNAL_SERVER_ERROR, "Database not connected");

  const collections = await db.listCollections().toArray();
  const collectionExists = collections.some(
    (col) => col.name.toLowerCase() === id.toLowerCase(),
  );
  appAssert(collectionExists, NOT_FOUND, `Data of '${id}' not found.`);

  if (id.toLowerCase() !== "quran") {
    return await db.collection(id).find({}).sort({ uuid: 1 }).toArray();
  }

  // ---- Cursor pagination ----
  const {
    startType = "surah", // e.g. "surah", "juz", "ruku", etc.
    startValue, // e.g. 2
    after,
    before,
    limit = 20,
  } = query;

  const mongoQuery: any = {};

  if (startType && startValue) {
    mongoQuery[`${startType}`] = parseInt(startValue); // Used UUID (number), not ObjectId
  }

  if (after) {
    mongoQuery.uuid = { $gt: parseInt(after) };
  } else if (before) {
    mongoQuery.uuid = { $lt: parseInt(before) };
  }

  const sortOrder = before ? -1 : 1;

  const results = await QuranModel.find(mongoQuery, {
    createdAt: 0,
    updatedAt: 0,
  })
    .sort({ uuid: sortOrder })
    .limit(parseInt(limit))
    .lean();

  const data = before ? results.reverse() : results;

  return {
    data,
    nextCursor: data.length ? data[data.length - 1].uuid : null,
    prevCursor: data.length ? data[0].uuid : null,
  };
};
