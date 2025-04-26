import SurahModel from "../../models/surah.model";
import JuzModel from "../../models/juz.model";
import AyatModel from "../../models/ayat.model";

import { surahs } from "../../data/surahs";
import { loadAyats } from "../../utils/loadAyats";
import { juzList } from "../../data/juzList";

const initializeQuran = async () => {
  try {
    // Insert Juz if not already present
    const existingJuz = await JuzModel.countDocuments();
    let juzMap = new Map();
    if (existingJuz === 0) {
      const insertedJuz = await JuzModel.insertMany(juzList);
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
      const insertedSurahs = await SurahModel.insertMany(surahs);
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
    // await AyatModel.deleteMany({});
    // console.log("🗑️ Existing Ayats removed.");

    // Insert Ayats if not already present
    const existingAyats = await AyatModel.countDocuments();
    if (existingAyats === 0) {
      const rawAyats = loadAyats();
      const mappedAyats = rawAyats.map((ayat) => ({
        ...ayat,
        surahId: surahMap.get(ayat.surahId),
        juzId: juzMap.get(ayat.juzId),
      }));

      await AyatModel.insertMany(mappedAyats);
      console.log("✅ Ayats initialized successfully.");
    } else {
      console.log(
        `ℹ️ Ayats already initialized (${existingAyats} entries found).`,
      );
    }
  } catch (error) {
    console.error("❌ Error initializing Quran data:", error);
    process.exit(1);
  }
};

export default initializeQuran;
