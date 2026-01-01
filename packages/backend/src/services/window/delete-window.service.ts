import { PrimaryId } from '../../constants/primaryId';
import WindowModel from '../../models/window.model';
import appAssert from '../../utils/appAssert';
import { NOT_FOUND } from '../../constants/http';
import WindowType from '../../constants/types/windowType';
import SuhufModel from '../../models/suhuf.model';

export const deleteWindow = async (windowId: String, userId: PrimaryId) => {
  const window = await WindowModel.findOne({ _id: windowId, userId });
  appAssert(window, NOT_FOUND, 'Window not found');

  if (window.type === WindowType.Suhuf) {
    await SuhufModel.deleteOne({ _id: window.typeId, userId });
  }

  await WindowModel.deleteOne({ _id: window._id });
};
