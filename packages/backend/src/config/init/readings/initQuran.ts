import SurahModel from '../../../models/reading/surah.model.js';
import JuzModel from '../../../models/reading/juz.model.js';
import QuranModel from '../../../models/reading/quran.model.js';
import { loadJSONFiles } from '../../../utils/loadJSONFiles.js';
import { log } from '../../../utils/log.js';
import { UuidMap } from '../../../constants/ids.js';
import { juzListApi } from '../../../data/juzListApi.js';
import { surahsApi } from '../../../data/surahsApi.js';
import { initCollection } from './initCollection.js';

const initJuz = async (): Promise<UuidMap> => {
  return initCollection(JuzModel, juzListApi, 'Juz');
};

const initSurahs = async (): Promise<UuidMap> => {
  return initCollection(SurahModel, surahsApi, 'Surahs');
};

const initQuranStructure = async (
  juzMap: UuidMap,
  surahMap: UuidMap
): Promise<void> => {
  const exists = await QuranModel.countDocuments();

  if (exists > 0) {
    log.info(`Quran structure already initialized (${exists} entries found).`);
    return;
  }

  const rawQuran = loadJSONFiles('../data/quran');

  const structuralDocs = rawQuran.map((ayah: any) => {
    const surahId = surahMap.get(ayah.surahId);
    const juzId = juzMap.get(ayah.juzId);

    if (!surahId) {
      throw new Error(`Missing surahId mapping for uuid ${ayah.uuid}`);
    }

    if (!juzId) {
      throw new Error(`Missing juzId mapping for uuid ${ayah.uuid}`);
    }

    return {
      uuid: ayah.uuid,
      surahId,
      ayahNumber: ayah.sno,
      juzId,
      manzil: ayah.manzil,
      ruku: ayah.ruku,
      hizbQuarter: ayah.hizbQuarter,
      surahStart: ayah.surahStart,
      sajda: ayah.sajda,
    };
  });

  await QuranModel.insertMany(structuralDocs);

  const count = await QuranModel.countDocuments();

  if (count !== rawQuran.length) {
    throw new Error(
      `Quran structure mismatch after insert. Expected ${rawQuran.length}, got ${count}`
    );
  }

  log.success(`Quran structure initialized successfully (${count} ayahs).`);
};

const initQuran = async (): Promise<void> => {
  try {
    const [juzMap, surahMap] = await Promise.all([initJuz(), initSurahs()]);

    await initQuranStructure(juzMap, surahMap);
  } catch (error) {
    log.error('Error initializing Quran structure:', error);
    process.exit(1);
  }
};

export default initQuran;
