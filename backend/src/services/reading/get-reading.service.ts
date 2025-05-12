import mongoose from "mongoose";
import appAssert from "../../utils/appAssert";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../../constants/http";
import QuranModel from "../../models/quranModel";
import SurahModel from "../../models/surah.model";

const PAGE_SIZE = 50;

export const getReading = async (id: string, page = 1) => {
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

  const skip = (page - 1) * PAGE_SIZE;
  let data: any[];
  let total: number;

  if (id.toLowerCase() === "quran") {
    total = await QuranModel.countDocuments();
    data = await QuranModel.find({})
      .populate("surahId")
      .populate("juzId")
      .sort({ uuid: 1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean();
  } else {
    total = await db.collection(id).countDocuments();
    data = await db
      .collection(id)
      .find({})
      .sort({ uuid: 1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    data,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const getReadingBySurah = async (
  collection: string,
  surahId: number,
) => {
  const surah = await SurahModel.findOne({ uuid: surahId });
  appAssert(surah, NOT_FOUND, "Surah not found");

  const firstAyah = await QuranModel.findOne({ surahId: surah._id }).sort({
    uuid: 1,
  });
  appAssert(firstAyah, NOT_FOUND, "No ayah found for this surah");

  const page = Math.floor((firstAyah.uuid - 1) / PAGE_SIZE) + 1;

  return await getReading(collection, page);
};
