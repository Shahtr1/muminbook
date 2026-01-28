import QuranModel from '../../../models/reading/quran.model';
import { log } from '../../../utils/log';
import SahihI11lModel from '../../../models/reading/sahih-international.model';
import { loadSahihI11l } from '../../../utils/readings/loadSahihI11l';

const parseFootnotes = (footnotesRaw?: string): Map<string, string> => {
  const map = new Map<string, string>();

  if (!footnotesRaw) return map;

  const entries = footnotesRaw.split('\n');

  for (const entry of entries) {
    const match = entry.match(/^\[(\d+)]\s*(.*)$/);

    if (!match) continue;

    const [, key, value] = match;

    map.set(key, value.trim());
  }

  return map;
};

const initSahihI11lVerses = async () => {
  const existing = await SahihI11lModel.countDocuments();

  if (existing === 0) {
    const raw = loadSahihI11l();

    const quranDocs = await QuranModel.find({}, { _id: 1, uuid: 1 }).lean();

    const quranMap = new Map<string, any>(
      quranDocs.map((doc: any) => [doc.uuid, doc._id])
    );

    const mapped = raw.map((ayah) => {
      const quranId = quranMap.get(ayah.uuid);

      if (!quranId) {
        throw new Error(`Missing Quran reference for uuid: ${ayah.uuid}`);
      }

      return {
        uuid: ayah.uuid,
        ayah: ayah.ayah,
        quranId,
        footnotes: parseFootnotes(ayah.footnotes),
      };
    });

    await SahihI11lModel.insertMany(mapped);

    log.success('SahihI11l initialized successfully.');
  } else {
    log.info(`SahihI11l already initialized (${existing} entries found).`);
  }
};

const initSahihI11l = async () => {
  try {
    await initSahihI11lVerses();
  } catch (error) {
    log.error('Error initializing Sahih International :', error);
    process.exit(1);
  }
};

export default initSahihI11l;
