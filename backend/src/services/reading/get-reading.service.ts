import mongoose from "mongoose";
import QuranModel from "../../models/quran.model";
import appAssert from "../../utils/appAssert";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../../constants/http";

import SurahModel from "../../models/surah.model";
import JuzModel from "../../models/juz.model";

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

  const { startType = "surah", startValue, after, before, limit = 20 } = query;

  const mongoQuery: any = {};

  if (startType && startValue) {
    const numericStartValue = parseInt(startValue);

    if (after) {
      mongoQuery.uuid = { $gt: parseInt(after) };
    } else if (before) {
      mongoQuery.uuid = { $lt: parseInt(before) };
    } else {
      if (startType === "surah") {
        const surah = await SurahModel.findOne({ uuid: numericStartValue });
        appAssert(surah, NOT_FOUND, `Surah with uuid ${startValue} not found`);

        const firstAyah = await QuranModel.findOne({ surahId: surah._id })
          .sort({ uuid: 1 })
          .select({ uuid: 1 })
          .lean();
        appAssert(
          firstAyah,
          NOT_FOUND,
          `No ayah found for surah ${startValue}`,
        );

        mongoQuery.uuid = { $gte: firstAyah.uuid };
      } else if (startType === "juz") {
        const juz = await JuzModel.findOne({ uuid: numericStartValue });
        appAssert(juz, NOT_FOUND, `Juz with uuid ${startValue} not found`);

        const firstAyah = await QuranModel.findOne({ juzId: juz._id })
          .sort({ uuid: 1 })
          .select({ uuid: 1 })
          .lean();
        appAssert(firstAyah, NOT_FOUND, `No ayah found for juz ${startValue}`);

        mongoQuery.uuid = { $gte: firstAyah.uuid };
      } else if (["manzil", "ruku", "hizbQuarter"].includes(startType)) {
        mongoQuery[startType] = numericStartValue;

        const firstAyah = await QuranModel.findOne({
          [startType]: numericStartValue,
        })
          .sort({ uuid: 1 })
          .select({ uuid: 1 })
          .lean();
        appAssert(
          firstAyah,
          NOT_FOUND,
          `No ayah found for ${startType} ${startValue}`,
        );

        mongoQuery.uuid = { $gte: firstAyah.uuid };
      } else {
        appAssert(false, BAD_REQUEST, `Unsupported startType: ${startType}`);
      }
    }
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
