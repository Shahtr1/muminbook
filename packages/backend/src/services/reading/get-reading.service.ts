import QuranModel from '../../models/reading/quran.model.js';
import { ReadingQuery } from '../../schemas/reading.schema.js';
import QuranDivisionType from '../../constants/types/quran/quranDivisionType.js';
import SurahModel from '../../models/reading/surah.model.js';
import JuzModel from '../../models/reading/juz.model.js';
import appAssert from '../../utils/appAssert.js';
import { NOT_FOUND } from '../../constants/http.js';

export const getReading = async (source: string, query: ReadingQuery) => {
  const {
    limit,
    category,
    divisionNumber,
    divisionType,
    afterUuid,
    beforeUuid,
  } = query;

  let uuidCondition: any = {};
  let sortDirection: 1 | -1 = 1;

  // -------------------------------------------------
  // DIVISION ANCHOR → resolve start UUID
  // -------------------------------------------------

  if (
    divisionNumber !== undefined &&
    divisionType &&
    afterUuid === undefined &&
    beforeUuid === undefined
  ) {
    let startUuid: number | null = null;

    switch (divisionType) {
      case QuranDivisionType.Surah: {
        const surah = await SurahModel.findOne({ uuid: divisionNumber });
        appAssert(surah, NOT_FOUND, 'Surah not found');

        const firstAyah = await QuranModel.findOne({
          surahId: surah._id,
        })
          .sort({ uuid: 1 })
          .lean();

        appAssert(firstAyah, NOT_FOUND, 'No ayahs found');
        startUuid = firstAyah.uuid;
        break;
      }

      case QuranDivisionType.Juz: {
        const juz = await JuzModel.findOne({ uuid: divisionNumber });
        appAssert(juz, NOT_FOUND, 'Juz not found');

        const firstAyah = await QuranModel.findOne({
          juzId: juz._id,
        })
          .sort({ uuid: 1 })
          .lean();

        appAssert(firstAyah, NOT_FOUND, 'No ayahs found');
        startUuid = firstAyah.uuid;
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

        const firstAyah = await QuranModel.findOne({
          [fieldMap[divisionType]]: divisionNumber,
        })
          .sort({ uuid: 1 })
          .lean();

        appAssert(firstAyah, NOT_FOUND, 'No ayahs found');
        startUuid = firstAyah.uuid;
        break;
      }
    }

    uuidCondition = { uuid: { $gte: startUuid } };
  }

  // -------------------------------------------------
  // CURSOR
  // -------------------------------------------------

  if (afterUuid !== undefined) {
    uuidCondition = { uuid: { $gt: afterUuid } };
    sortDirection = 1;
  }

  if (beforeUuid !== undefined) {
    uuidCondition = { uuid: { $lt: beforeUuid } };
    sortDirection = -1;
  }

  // -------------------------------------------------
  // AGGREGATION PIPELINE
  // -------------------------------------------------

  const pipeline: any[] = [
    { $match: uuidCondition },

    { $sort: { uuid: sortDirection } },

    // Fetch limit + 1 for next detection
    { $limit: limit + 1 },

    {
      $lookup: {
        from: 'quran_content',
        let: { localUuid: '$uuid' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$uuid', '$$localUuid'] },
                  { $eq: ['$category', category] },
                  { $eq: ['$source', source] },
                ],
              },
            },
          },
        ],
        as: 'content',
      },
    },

    {
      $addFields: {
        content: { $arrayElemAt: ['$content', 0] },
      },
    },
  ];

  let results = await QuranModel.aggregate(pipeline);

  if (sortDirection === -1) {
    results = results.reverse();
  }

  let hasExtra = results.length > limit;

  if (hasExtra) {
    results.pop();
  }

  if (results.length === 0) {
    return {
      data: [],
      nextCursor: null,
      prevCursor: null,
      hasNext: false,
      hasPrevious: false,
    };
  }

  const first = results[0];
  const last = results[results.length - 1];

  // -------------------------------------------------
  // GLOBAL EXISTENCE CHECK (lightweight)
  // -------------------------------------------------

  const [hasPreviousDoc, hasNextDoc] = await Promise.all([
    QuranModel.exists({ uuid: { $lt: first.uuid } }),
    QuranModel.exists({ uuid: { $gt: last.uuid } }),
  ]);

  return {
    data: results,
    nextCursor: last.uuid,
    prevCursor: first.uuid,
    hasNext: !!hasNextDoc,
    hasPrevious: !!hasPreviousDoc,
  };
};
