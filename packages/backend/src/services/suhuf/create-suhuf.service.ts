import { PrimaryId } from '../../constants/ids.js';
import SuhufModel from '../../models/suhuf.model.js';
import WindowModel from '../../models/window.model.js';
import WindowType from '../../constants/types/windowType.js';
import appAssert from '../../utils/appAssert.js';
import { INTERNAL_SERVER_ERROR } from '../../constants/http.js';

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
  }).catch(async () => {
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
