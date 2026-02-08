/**
 * @fileoverview Quran Structure Service Test Suite
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getQuranStructureCounts } from '../get-reading-structure.service';
import QuranModel from '../../../models/reading/quran.model';

vi.mock('../../../models/reading/quran.model', () => ({
  default: {
    aggregate: vi.fn(),
  },
}));

describe('Quran Structure Service - getQuranStructureCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return aggregated structure counts', async () => {
    const mockResult = [
      {
        surah: [{ surah: 1, totalAyat: 7 }],
        juz: [{ juz: 1, totalAyat: 148 }],
        manzil: [{ manzil: 1, totalAyat: 669 }],
        ruku: [{ ruku: 1, totalAyat: 7 }],
        hizb: [{ hizb: 1, totalAyat: 95 }],
      },
    ];

    (QuranModel.aggregate as any).mockResolvedValue(mockResult);

    const result = await getQuranStructureCounts();

    expect(QuranModel.aggregate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResult[0]);
    expect(result.surah[0].totalAyat).toBe(7);
    expect(result.juz[0].totalAyat).toBe(148);
    expect(result.manzil[0].totalAyat).toBe(669);
    expect(result.ruku[0].totalAyat).toBe(7);
    expect(result.hizb[0].totalAyat).toBe(95);
  });

  it('should return undefined if aggregation returns empty array', async () => {
    (QuranModel.aggregate as any).mockResolvedValue([]);

    const result = await getQuranStructureCounts();

    expect(result).toBeUndefined();
  });

  it('should propagate database errors', async () => {
    (QuranModel.aggregate as any).mockRejectedValue(new Error('DB error'));

    await expect(getQuranStructureCounts()).rejects.toThrow('DB error');
  });
});
