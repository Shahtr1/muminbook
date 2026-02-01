import { log } from '../../../utils/log';
import { UuidMap } from '../../../constants/ids';

export const initCollection = async (
  Model: any,
  data: any[],
  label: string
): Promise<UuidMap> => {
  const existingDocs = await Model.find({}, { _id: 1, uuid: 1 }).lean();

  if (existingDocs.length === 0) {
    const inserted = await Model.insertMany(data);
    log.success(`${label} initialized successfully.`);
    return new Map(inserted.map((doc: any) => [doc.uuid, doc._id]));
  }

  log.info(
    `${label} already initialized (${existingDocs.length} entries found).`
  );

  return new Map(existingDocs.map((doc: any) => [doc.uuid, doc._id]));
};
