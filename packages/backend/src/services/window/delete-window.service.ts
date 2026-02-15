import { PrimaryId } from '../../constants/ids.js';
import WindowModel from '../../models/window.model.js';
import appAssert from '../../utils/appAssert.js';
import { NOT_FOUND } from '../../constants/http.js';
import WindowType from '../../constants/types/windowType.js';
import SuhufModel from '../../models/suhuf.model.js';

export const deleteWindow = async (windowId: String, userId: PrimaryId) => {
  const window = await WindowModel.findOne({ _id: windowId, userId });
  appAssert(window, NOT_FOUND, 'Window not found');

  if (window.type === WindowType.Suhuf) {
    await SuhufModel.deleteOne({ _id: window.typeId, userId });
  }

  await WindowModel.deleteOne({ _id: window._id });
};
