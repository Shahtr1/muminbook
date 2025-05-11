import SurahModel from "../../models/surah.model";
import JuzModel from "../../models/juz.model";
import QuranModel from "../../models/quranModel";
import ReadingModel from "../../models/reading.model";
import { surahsApi } from "../../data/surahsApi";
import { loadQuran } from "../../utils/loadQuran";
import { juzListApi } from "../../data/juzListApi";
import { readingsApi } from "../../data/readingsApi";

const initializeJuz = async () => {
  const existing = await JuzModel.countDocuments();
  if (existing === 0) {
    const inserted = await JuzModel.insertMany(juzListApi);
    console.log("✅ Juz initialized successfully.");
    return new Map(inserted.map((juz) => [juz.uuid, juz._id]));
  }
  console.log(`ℹ️ Juz already initialized (${existing} entries found).`);
  const existingJuz = await JuzModel.find();
  return new Map(existingJuz.map((juz) => [juz.uuid, juz._id]));
};

const initializeSurahs = async () => {
  const existing = await SurahModel.countDocuments();
  if (existing === 0) {
    const inserted = await SurahModel.insertMany(surahsApi);
    console.log("✅ Surahs initialized successfully.");
    return new Map(inserted.map((surah) => [surah.uuid, surah._id]));
  }
  console.log(`ℹ️ Surahs already initialized (${existing} entries found).`);
  const existingSurahs = await SurahModel.find();
  return new Map(existingSurahs.map((surah) => [surah.uuid, surah._id]));
};

const initializeQuranVerses = async (juzMap: any, surahMap: any) => {
  // await QuranModel.deleteMany({});
  const existing = await QuranModel.countDocuments();
  if (existing === 0) {
    const rawQuran = loadQuran();
    const mappedQuran = rawQuran.map((ayah) => ({
      ...ayah,
      surahId: surahMap.get(ayah.surahId),
      juzId: juzMap.get(ayah.juzId),
    }));
    await QuranModel.insertMany(mappedQuran);
    console.log("✅ Quran initialized successfully.");
  } else {
    console.log(`ℹ️ Quran already initialized (${existing} entries found).`);
  }
};

const initializeReadings = async () => {
  const existing = await ReadingModel.countDocuments();
  if (existing === 0) {
    await ReadingModel.insertMany(readingsApi);
    console.log("✅ Readings initialized successfully.");
  } else {
    console.log(`ℹ️ Readings already initialized (${existing} entries found).`);
  }
};

const initializeQuran = async () => {
  try {
    const juzMap = await initializeJuz();
    const surahMap = await initializeSurahs();
    await initializeQuranVerses(juzMap, surahMap);
    await initializeReadings();
    console.log("🎉 Initialization complete.");
  } catch (error) {
    console.error("❌ Error initializing :", error);
    process.exit(1);
  }
};

export default initializeQuran;
