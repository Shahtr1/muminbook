import { PrimaryId } from '../../constants/ids.js';
import SuhufModel from '../../models/suhuf.model.js';
import appAssert from '../../utils/appAssert.js';
import { CONFLICT, NOT_FOUND } from '../../constants/http.js';

export const renameSuhuf = async (
  suhufId: string,
  userId: PrimaryId,
  newTitle: string
) => {
  const suhuf = await SuhufModel.findOne({ _id: suhufId, userId });
  appAssert(suhuf, NOT_FOUND, 'Suhuf not found');

  const conflict = await SuhufModel.findOne({
    title: newTitle,
    userId,
  });

  appAssert(!conflict, CONFLICT, `A suhuf with this title already exists`);

  suhuf.title = newTitle;
  await suhuf.save();

  return {
    message: 'Renamed successfully',
  };
};
