import mongoose from 'mongoose';
import QuranModel from '../../models/quran.model';
import appAssert from '../../utils/appAssert';
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from '../../constants/http';

import SurahModel from '../../models/surah.model';
import JuzModel from '../../models/juz.model';
import QuranDivisionType from '../../constants/types/quran/quranDivisionType';

async function getPaginatedCollection(query: any) {
  console.log('query', query);
}

export const getReading = async (id: string, query: any = {}) => {
  const db = mongoose.connection.db;
  appAssert(db, INTERNAL_SERVER_ERROR, 'Database not connected');

  const collections = await db.listCollections().toArray();
  const collectionExists = collections.some(
    (col) => col.name.toLowerCase() === id.toLowerCase()
  );
  appAssert(collectionExists, NOT_FOUND, `Data of '${id}' not found.`);

  if (id.toLowerCase() !== 'quran') {
    return await db.collection(id).find({}).sort({ uuid: 1 }).toArray();
  }

  return await getPaginatedCollection(query);
};
