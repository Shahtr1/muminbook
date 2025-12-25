import catchErrors from '../utils/catchErrors';
import { OK } from '../constants/http';
import { assertUserAndSession } from '../utils/assertUserRoleSession';
import { getUserId } from '../utils/getUserId';
import WindowModel from '../models/window.model';
import { SuhufDocument } from '../models/suhuf.model';
import { deleteWindow } from '../services/window/delete-window.service';

export const getWindowsHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);

  const windows = await WindowModel.find({ userId })
    .sort({ updatedAt: -1 })
    .populate<{
      typeId: Pick<SuhufDocument, '_id' | 'title'> | undefined;
    }>('typeId', 'title _id');

  return res.status(OK).json(windows);
});

export const deleteWindowHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);
  const userId = await getUserId(req);
  const { id } = req.params;

  await deleteWindow(id, userId);

  return res.status(OK).json({ message: 'Window deleted successfully' });
});
