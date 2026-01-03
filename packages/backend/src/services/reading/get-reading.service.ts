import { getDbOrAssertCollection } from '../../utils/dbHelper';

export const getReading = async (id: string, query: any = {}) => {
  const db = await getDbOrAssertCollection(id);

  return await db.collection(id).find({}).sort({ uuid: 1 }).toArray();
};
