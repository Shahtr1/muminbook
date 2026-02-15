import catchErrors from '../utils/catchErrors.js';
import { OK } from '../constants/http.js';
import FamilyTreeModel from '../models/family-tree.model.js';

export const getFamilyTreeHandler = catchErrors(async (req, res) => {
  const familyTree = await FamilyTreeModel.find().lean();

  return res.status(OK).json(familyTree);
});
