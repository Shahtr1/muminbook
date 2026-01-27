import { getDbOrAssertCollection } from '../../utils/dbHelper';

export const getReading = async (uuid: string, query: any = {}) => {
  const db = await getDbOrAssertCollection(uuid);

  const { limit, page } = query;

  const skip = (page - 1) * limit;

  const collection = db.collection(uuid);

  const data = await collection
    .find({})
    .sort({ uuid: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await collection.countDocuments();

  return {
    data,
    page,
    limit,
    total,
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
};
