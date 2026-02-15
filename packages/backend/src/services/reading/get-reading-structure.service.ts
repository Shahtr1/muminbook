import QuranModel from '../../models/reading/quran.model.js';

export interface QuranStructureCounts {
  surah: { surah: number; totalAyat: number }[];
  juz: { juz: number; totalAyat: number }[];
  manzil: { manzil: number; totalAyat: number }[];
  ruku: { ruku: number; totalAyat: number }[];
  hizb: { hizb: number; totalAyat: number }[];
}

export const getQuranStructureCounts =
  async (): Promise<QuranStructureCounts> => {
    const result = await QuranModel.aggregate([
      {
        $facet: {
          // =========================
          // SURAH COUNTS (1–114)
          // =========================
          surah: [
            {
              $group: {
                _id: '$surahId',
                totalAyat: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: 'surahs',
                localField: '_id',
                foreignField: '_id',
                as: 'surah',
              },
            },
            { $unwind: '$surah' },
            {
              $project: {
                _id: 0,
                surah: '$surah.uuid',
                totalAyat: 1,
              },
            },
            { $sort: { surah: 1 } },
          ],

          // =========================
          // JUZ COUNTS
          // =========================
          juz: [
            {
              $group: {
                _id: '$juzId',
                totalAyat: { $sum: 1 },
              },
            },
            {
              $lookup: {
                from: 'juz',
                localField: '_id',
                foreignField: '_id',
                as: 'juz',
              },
            },
            { $unwind: '$juz' },
            {
              $project: {
                _id: 0,
                juz: '$juz.uuid',
                totalAyat: 1,
              },
            },
            { $sort: { juz: 1 } },
          ],

          // =========================
          // MANZIL
          // =========================
          manzil: [
            {
              $group: {
                _id: '$manzil',
                totalAyat: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                manzil: '$_id',
                totalAyat: 1,
              },
            },
            { $sort: { manzil: 1 } },
          ],

          // =========================
          // RUKU
          // =========================
          ruku: [
            {
              $group: {
                _id: '$ruku',
                totalAyat: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                ruku: '$_id',
                totalAyat: 1,
              },
            },
            { $sort: { ruku: 1 } },
          ],

          // =========================
          // HIZB (1–60)
          // =========================
          hizb: [
            {
              $addFields: {
                hizb: {
                  $ceil: { $divide: ['$hizbQuarter', 4] },
                },
              },
            },
            {
              $group: {
                _id: '$hizb',
                totalAyat: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                hizb: '$_id',
                totalAyat: 1,
              },
            },
            { $sort: { hizb: 1 } },
          ],
        },
      },
    ]);

    return result[0] as QuranStructureCounts;
  };
