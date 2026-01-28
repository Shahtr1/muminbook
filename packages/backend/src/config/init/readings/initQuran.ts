import { Types } from 'mongoose';
import SurahModel from '../../../models/reading/surah.model';
import JuzModel from '../../../models/reading/juz.model';
import QuranModel from '../../../models/reading/quran.model';
import { surahsApi } from '../../../data/surahsApi';
import { loadQuran } from '../../../utils/readings/loadQuran';
import { juzListApi } from '../../../data/juzListApi';
import { log } from '../../../utils/log';

type UuidMap = Map<string, Types.ObjectId>;

const initCollection = async (
  Model: any,
  data: any[],
  label: string
): Promise<UuidMap> => {
  const existingDocs = await Model.find({}, { _id: 1, uuid: 1 }).lean();

  if (existingDocs.length === 0) {
    const inserted = await Model.insertMany(data);
    log.success(`${label} initialized successfully.`);
    return new Map(inserted.map((doc: any) => [doc.uuid, doc._id]));
  }

  log.info(
    `${label} already initialized (${existingDocs.length} entries found).`
  );
  return new Map(existingDocs.map((doc: any) => [doc.uuid, doc._id]));
};

const initJuz = async (): Promise<UuidMap> => {
  return initCollection(JuzModel, juzListApi, 'Juz');
};

const initSurahs = async (): Promise<UuidMap> => {
  return initCollection(SurahModel, surahsApi, 'Surahs');
};

const initQuranVerses = async (
  juzMap: UuidMap,
  surahMap: UuidMap
): Promise<void> => {
  const exists = await QuranModel.exists({});
  if (exists) {
    const count = await QuranModel.countDocuments();
    log.info(`Quran already initialized (${count} entries found).`);
    return;
  }

  const rawQuran = loadQuran();

  const mappedQuran = rawQuran.map((ayah) => ({
    ...ayah,
    surahId: surahMap.get(ayah.surahId),
    juzId: juzMap.get(ayah.juzId),
  }));

  await QuranModel.insertMany(mappedQuran);
  log.success('Quran initialized successfully.');
};

const initQuran = async (): Promise<void> => {
  try {
    const [juzMap, surahMap] = await Promise.all([initJuz(), initSurahs()]);

    await initQuranVerses(juzMap, surahMap);
  } catch (error) {
    log.error('Error initializing Quran:', error);
    process.exit(1);
  }
};

export default initQuran;
