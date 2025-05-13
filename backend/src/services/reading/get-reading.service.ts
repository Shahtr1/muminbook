import mongoose from "mongoose";
import appAssert from "../../utils/appAssert";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../../constants/http";
import QuranModel from "../../models/quranModel";

export const getReading = async (id: string) => {
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

  let data: any[] = [];

  if (id.toLowerCase() === "quran") {
    data = await QuranModel.find({}, { createdAt: 0, updatedAt: 0 })
      .sort({ uuid: 1 })
      .lean();
  } else {
    data = await db.collection(id).find({}).sort({ uuid: 1 }).toArray();
  }

  return {
    data,
    total: data.length,
  };
};
