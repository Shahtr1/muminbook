import mongoose from "mongoose";
import appAssert from "../../utils/appAssert";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../../constants/http";
import QuranModel from "../../models/quran.model";

export const getReading = async (id: string, query?: any) => {
  const db = mongoose.connection.db;
  appAssert(db, INTERNAL_SERVER_ERROR, "Database not connected");

  const collections = await db.listCollections().toArray();
  const collectionExists = collections.some(
    (col) => col.name.toLowerCase() === id.toLowerCase(),
  );

  appAssert(
    collectionExists,
    NOT_FOUND,
    `Data of '${id}' not found in the database.`,
  );

  if (id.toLowerCase() === "quran") {
    const { surahId, juzId, ruku, hizbQuarter, skip = 0, limit = 20 } = query;

    const mongoQuery: any = {};
    if (surahId) mongoQuery.surahId = new mongoose.Types.ObjectId(surahId);
    if (juzId) mongoQuery.juzId = new mongoose.Types.ObjectId(juzId);
    if (ruku != null) mongoQuery.ruku = parseInt(ruku);
    if (hizbQuarter != null) mongoQuery.hizbQuarter = parseInt(hizbQuarter);

    return QuranModel.find(mongoQuery, { createdAt: 0, updatedAt: 0 })
      .sort({ uuid: 1 })
      .skip(parseInt(skip) || 0)
      .limit(parseInt(limit) || 20)
      .lean();
  } else {
    return await db.collection(id).find({}).sort({ uuid: 1 }).toArray();
  }
};
