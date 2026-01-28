import { getDbOrAssertCollection } from '../../utils/dbHelper';

export const getReading = async (collectionParam: string, query: any = {}) => {
  const { db, collectionName } = await getDbOrAssertCollection(collectionParam);

  // Safe pagination defaults
  const limit = Math.max(parseInt(query.limit) || 10, 1);
  const page = Math.max(parseInt(query.page) || 1, 1);

  const skip = (page - 1) * limit;

  const collection = db.collection(collectionName!);

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
