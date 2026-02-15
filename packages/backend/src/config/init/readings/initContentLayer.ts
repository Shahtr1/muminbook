import QuranContentModel from '../../../models/reading/quran-content.model.js';
import QuranModel from '../../../models/reading/quran.model.js';
import { log } from '../../../utils/log.js';
import { loadJSONFiles } from '../../../utils/loadJSONFiles.js';

interface InitContentLayerOptions {
  folder: string;
  category: 'quran' | 'translation' | 'tafsir';
  source: string;
  locale: string;
  parseFootnotes?: boolean;
}

const parseFootnotes = (raw?: string): Record<string, string> => {
  if (!raw) return {};

  const result: Record<string, string> = {};
  const entries = raw.split('\n');

  for (const entry of entries) {
    const match = entry.match(/^\[(\d+)]\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    result[key] = value.trim();
  }

  return result;
};

const initContentLayer = async ({
  folder,
  category,
  source,
  locale,
  parseFootnotes: shouldParseFootnotes = false,
}: InitContentLayerOptions): Promise<void> => {
  // Check existing
  const existing = await QuranContentModel.countDocuments({
    category,
    source,
  });

  if (existing > 0) {
    log.info(
      `${source} (${category}) already initialized (${existing} entries found).`
    );
    return;
  }

  // Ensure Quran structure exists
  const structuralCount = await QuranModel.countDocuments();
  if (structuralCount === 0) {
    throw new Error(
      'Quran structure must be initialized before content layers.'
    );
  }

  // Load raw layer
  const raw = loadJSONFiles(folder);

  if (!raw || raw.length === 0) {
    throw new Error(`No JSON data found in folder: ${folder}`);
  }

  // Length validation
  if (raw.length !== structuralCount) {
    throw new Error(
      `Content layer "${source}" ayah count mismatch.
Expected: ${structuralCount}
Found: ${raw.length}`
    );
  }

  // UUID validation
  const structuralUuids = await QuranModel.find({}, { uuid: 1 }).lean();
  const uuidSet = new Set(structuralUuids.map((doc) => doc.uuid));

  for (const ayah of raw) {
    if (!uuidSet.has(ayah.uuid)) {
      throw new Error(
        `Invalid uuid ${ayah.uuid} in content layer "${source}".`
      );
    }
  }

  // Map
  const mapped = raw.map((ayah: any) => ({
    uuid: ayah.uuid,
    category,
    source,
    locale,
    text: ayah.ayah,
    footnotes:
      shouldParseFootnotes && ayah.footnotes
        ? parseFootnotes(ayah.footnotes)
        : undefined,
  }));

  // Insert
  await QuranContentModel.insertMany(mapped);

  log.success(`${source} (${category}) initialized successfully.`);
};

export default initContentLayer;
