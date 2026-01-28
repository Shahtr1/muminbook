import SurahModel from '../../models/reading/surah.model';
import JuzModel from '../../models/reading/juz.model';
import QuranModel from '../../models/reading/quran.model';
import { surahsApi } from '../../data/surahsApi';
import { loadQuran } from '../../utils/loadQuran';
import { juzListApi } from '../../data/juzListApi';
import { log } from '../../utils/log';

const initJuz = async () => {
  const existing = await JuzModel.countDocuments();
  if (existing === 0) {
    const inserted = await JuzModel.insertMany(juzListApi);
    log.success('Juz initialized successfully.');
    return new Map(inserted.map((juz) => [juz.uuid, juz._id]));
  }
  log.info(`Juz already initialized (${existing} entries found).`);
  const existingJuz = await JuzModel.find();
  return new Map(existingJuz.map((juz) => [juz.uuid, juz._id]));
};

const initSurahs = async () => {
  const existing = await SurahModel.countDocuments();
  if (existing === 0) {
    const inserted = await SurahModel.insertMany(surahsApi);
    log.success('Surahs initialized successfully.');
    return new Map(inserted.map((surah) => [surah.uuid, surah._id]));
  }
  log.info(`Surahs already initialized (${existing} entries found).`);
  const existingSurahs = await SurahModel.find();
  return new Map(existingSurahs.map((surah) => [surah.uuid, surah._id]));
};

const initQuranVerses = async (juzMap: any, surahMap: any) => {
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
    log.success('Quran initialized successfully.');
  } else {
    log.info(`Quran already initialized (${existing} entries found).`);
  }
};

const initQuran = async () => {
  try {
    const juzMap = await initJuz();
    const surahMap = await initSurahs();
    await initQuranVerses(juzMap, surahMap);
  } catch (error) {
    log.error('Error initializing Quran :', error);
    process.exit(1);
  }
};

export default initQuran;
