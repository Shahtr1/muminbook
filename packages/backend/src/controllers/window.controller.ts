import catchErrors from '../utils/catchErrors.js';
import { OK } from '../constants/http.js';
import { getUserId } from '../utils/getUserId.js';
import WindowModel from '../models/window.model.js';
import { SuhufDocument } from '../models/suhuf.model.js';
import { deleteWindow } from '../services/window/delete-window.service.js';

export const getWindowsHandler = catchErrors(async (req, res) => {
  const userId = await getUserId(req);

  const windows = await WindowModel.find({ userId })
    .sort({ updatedAt: -1 })
    .populate<{
      typeId: Pick<SuhufDocument, '_id' | 'title'> | undefined;
    }>('typeId', 'title _id');

  return res.status(OK).json(windows);
});

export const deleteWindowHandler = catchErrors(async (req, res) => {
  const userId = await getUserId(req);
  const { id } = req.params;

  await deleteWindow(id, userId);

  return res.status(OK).json({ message: 'Window deleted successfully' });
});
