import { getDbOrAssertCollection } from '../../utils/dbHelper';
import { ReadingQuery } from '../../schemas/reading.schema';
import QuranDivisionType from '../../constants/types/quran/quranDivisionType';
import SurahModel from '../../models/reading/surah.model';
import JuzModel from '../../models/reading/juz.model';
import appAssert from '../../utils/appAssert';
import { NOT_FOUND } from '../../constants/http';

export const getReading = async (
  collectionParam: string,
  query: ReadingQuery
) => {
  const { db, collectionName } = await getDbOrAssertCollection(collectionParam);

  const { limit, uuid, divisionType, afterUuid, beforeUuid } = query;

  const collection = db.collection(collectionName!);

  let startUuid: number | null = null;

  // Anchor logic
  if (uuid !== undefined && divisionType) {
    switch (divisionType) {
      case QuranDivisionType.Surah: {
        const surah = await SurahModel.findOne({ uuid });
        appAssert(surah, NOT_FOUND, 'Surah not found');

        const firstAyah = await collection
          .find({ surahId: surah!._id })
          .sort({ uuid: 1 })
          .limit(1)
          .toArray();

        appAssert(firstAyah.length > 0, NOT_FOUND, 'No ayahs found');

        startUuid = firstAyah[0].uuid;
        break;
      }

      case QuranDivisionType.Juz: {
        const juz = await JuzModel.findOne({ uuid });
        appAssert(juz, NOT_FOUND, 'Juz not found');

        const firstAyah = await collection
          .find({ juzId: juz!._id })
          .sort({ uuid: 1 })
          .limit(1)
          .toArray();

        appAssert(firstAyah.length > 0, NOT_FOUND, 'No ayahs found');

        startUuid = firstAyah[0].uuid;
        break;
      }

      case QuranDivisionType.Manzil:
      case QuranDivisionType.Ruku:
      case QuranDivisionType.Hizb: {
        const fieldMap = {
          [QuranDivisionType.Manzil]: 'manzil',
          [QuranDivisionType.Ruku]: 'ruku',
          [QuranDivisionType.Hizb]: 'hizbQuarter',
        } as const;

        const field = fieldMap[divisionType];

        const firstAyah = await collection
          .find({ [field]: uuid })
          .sort({ uuid: 1 })
          .limit(1)
          .toArray();

        appAssert(firstAyah.length > 0, NOT_FOUND, 'No ayahs found');

        startUuid = firstAyah[0].uuid;
        break;
      }
    }
  }

  // Cursor logic
  const filter: any = {};
  let sortDirection: 1 | -1 = 1;

  if (afterUuid !== undefined) {
    filter.uuid = { $gt: afterUuid };
    sortDirection = 1;
  } else if (beforeUuid !== undefined) {
    filter.uuid = { $lt: beforeUuid };
    sortDirection = -1;
  } else if (startUuid !== null) {
    filter.uuid = { $gte: startUuid };
    sortDirection = 1;
  }

  // Fetch chunk
  let data = await collection
    .find(filter)
    .sort({ uuid: sortDirection })
    .limit(limit)
    .toArray();

  // Reverse if fetching backwards
  if (sortDirection === -1) {
    data = data.reverse();
  }

  const firstItem = data[0];
  const lastItem = data[data.length - 1];

  return {
    data,
    nextCursor: lastItem?.uuid ?? null,
    prevCursor: firstItem?.uuid ?? null,
    hasNext: !!lastItem && lastItem.uuid < 6236,
    hasPrevious: !!firstItem && firstItem.uuid > 1,
  };
};
