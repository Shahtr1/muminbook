import { PrimaryId } from '../../constants/primaryId';
import SuhufModel from '../../models/suhuf.model';
import WindowModel from '../../models/window.model';
import WindowType from '../../constants/enums_types/windowType';
import appAssert from '../../utils/appAssert';
import { INTERNAL_SERVER_ERROR } from '../../constants/http';

type CreateSuhufInput = {
  userId: PrimaryId;
  title?: string;
};

export const createSuhuf = async ({
  userId,
  title = 'Untitled Suhuf',
}: CreateSuhufInput) => {
  const suhuf = await SuhufModel.create({
    userId,
    title,
    fileIds: [],
    activeFileId: null,
  });

  const window = await WindowModel.create({
    userId,
    type: WindowType.Suhuf,
    typeId: suhuf._id,
  }).catch(async (err) => {
    await SuhufModel.findByIdAndDelete(suhuf._id);
    appAssert(
      false,
      INTERNAL_SERVER_ERROR,
      'Failed to create window for Suhuf'
    );
  });

  appAssert(window, INTERNAL_SERVER_ERROR, 'Window creation failed');

  return { suhuf, window };
};
