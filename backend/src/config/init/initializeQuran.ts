import SurahModel from "../../models/surah.model";
import JuzModel from "../../models/juz.model";
import QuranModel from "../../models/quranModel";
import ReadingModel from "../../models/reading.model"; // ➡️ Import ReadingModel
import { surahsApi } from "../../data/surahsApi";
import { loadQuran } from "../../utils/loadQuran";
import { juzListApi } from "../../data/juzListApi";
import { readingsApi } from "../../data/readingsApi"; // ➡️ Import readings array

const initializeQuran = async () => {
  try {
    // Insert Juz if not already present
    const existingJuz = await JuzModel.countDocuments();
    let juzMap = new Map();
    if (existingJuz === 0) {
      const insertedJuz = await JuzModel.insertMany(juzListApi);
      juzMap = new Map(insertedJuz.map((juz) => [juz.uuid, juz._id]));
      console.log("✅ Juz initialized successfully.");
    } else {
      console.log(`ℹ️ Juz already initialized (${existingJuz} entries found).`);
      const existing = await JuzModel.find();
      juzMap = new Map(existing.map((juz) => [juz.uuid, juz._id]));
    }

    // Insert Surahs if not already present
    const existingSurahs = await SurahModel.countDocuments();
    let surahMap = new Map();
    if (existingSurahs === 0) {
      const insertedSurahs = await SurahModel.insertMany(surahsApi);
      surahMap = new Map(
        insertedSurahs.map((surah) => [surah.uuid, surah._id]),
      );
      console.log("✅ Surahs initialized successfully.");
    } else {
      console.log(
        `ℹ️ Surahs already initialized (${existingSurahs} entries found).`,
      );
      const existing = await SurahModel.find();
      surahMap = new Map(existing.map((surah) => [surah.uuid, surah._id]));
    }

    // TODO: remove this after writing all ayats
    // Always replace Ayats
    // await QuranModel.deleteMany({});
    // console.log("🗑️ Existing Quran removed.");

    // Insert Quran if not already present
    const existingQuran = await QuranModel.countDocuments();
    if (existingQuran === 0) {
      const rawQuran = loadQuran();
      const mappedQuran = rawQuran.map((quran) => ({
        ...quran,
        surahId: surahMap.get(quran.surahId),
        juzId: juzMap.get(quran.juzId),
      }));

      await QuranModel.insertMany(mappedQuran);
      console.log("✅  Quran initialized successfully.");
    } else {
      console.log(
        `ℹ️ Quran already initialized (${existingQuran} entries found).`,
      );
    }

    // Always replace Readings
    // await ReadingModel.deleteMany({});
    // console.log("🗑️ Existing Readings removed.");

    // Insert Readings if not already present
    const existingReadings = await ReadingModel.countDocuments();
    if (existingReadings === 0) {
      await ReadingModel.insertMany(readingsApi);
      console.log("✅  Readings initialized successfully.");
    } else {
      console.log(
        `ℹ️ Readings already initialized (${existingReadings} entries found).`,
      );
    }
  } catch (error) {
    console.error("❌ Error initializing Quran data:", error);
    process.exit(1);
  }
};

export default initializeQuran;
