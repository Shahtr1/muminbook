import catchErrors from '../utils/catchErrors';
import { OK } from '../constants/http';
import FamilyTreeModel from '../models/family-tree.model';

export const getFamilyTreeHandler = catchErrors(async (req, res) => {
  const familyTree = await FamilyTreeModel.find().lean();

  return res.status(OK).json(familyTree);
});
