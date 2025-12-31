import SurahModel from '../../models/surah.model';
import JuzModel from '../../models/juz.model';
import QuranModel from '../../models/quran.model';
import ReadingModel from '../../models/reading.model';
import { surahsApi } from '../../data/surahsApi';
import { loadQuran } from '../../utils/loadQuran';
import { juzListApi } from '../../data/juzListApi';
import { readingsApi } from '../../data/readingsApi';
import { log } from '../../utils/log';

const initializeJuz = async () => {
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

const initializeSurahs = async () => {
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

const initializeQuranVerses = async (juzMap: any, surahMap: any) => {
  // await QuranModel.deleteMany({});
  const existing = await QuranModel.countDocuments();
  if (existing === 0) {
    const rawQuran = loadQuran();
    const mappedQuran = rawQuran.map((ayat) => ({
      ...ayat,
      surahId: surahMap.get(ayat.surahId),
      juzId: juzMap.get(ayat.juzId),
    }));
    await QuranModel.insertMany(mappedQuran);
    log.success('Quran initialized successfully.');
  } else {
    log.info(`Quran already initialized (${existing} entries found).`);
  }
};

const initializeReadings = async () => {
  const existing = await ReadingModel.countDocuments();
  if (existing === 0) {
    await ReadingModel.insertMany(readingsApi);
    log.success('Readings initialized successfully.');
  } else {
    log.info(`Readings already initialized (${existing} entries found).`);
  }
};

const initializeQuran = async () => {
  try {
    const juzMap = await initializeJuz();
    const surahMap = await initializeSurahs();
    await initializeQuranVerses(juzMap, surahMap);
    await initializeReadings();
    log.success('Initialization complete.');
  } catch (error) {
    log.error('Error initializing :', error);
    process.exit(1);
  }
};

export default initializeQuran;
