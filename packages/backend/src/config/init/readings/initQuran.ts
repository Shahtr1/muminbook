import SurahModel from '../../../models/reading/surah.model';
import JuzModel from '../../../models/reading/juz.model';
import QuranModel from '../../../models/reading/quran.model';
import { loadJSONFiles } from '../../../utils/loadJSONFiles';
import { log } from '../../../utils/log';
import { UuidMap } from './initCollection';

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
    // Load surah & juz base tables
    const surahs = await SurahModel.find({}, { _id: 1, uuid: 1 }).lean();
    const juzList = await JuzModel.find({}, { _id: 1, uuid: 1 }).lean();

    if (surahs.length === 0) {
      throw new Error('Surah collection must be initialized first.');
    }

    if (juzList.length === 0) {
      throw new Error('Juz collection must be initialized first.');
    }

    const surahMap: UuidMap = new Map(surahs.map((s: any) => [s.uuid, s._id]));

    const juzMap: UuidMap = new Map(juzList.map((j: any) => [j.uuid, j._id]));

    await initQuranStructure(juzMap, surahMap);
  } catch (error) {
    log.error('Error initializing Quran structure:', error);
    process.exit(1);
  }
};

export default initQuran;
