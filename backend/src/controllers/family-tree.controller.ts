import catchErrors from "../utils/catchErrors";
import { assertUserAndSession } from "../utils/assertUserRoleSession";
import { OK } from "../constants/http";
import FamilyTreeModel from "../models/family-tree.model";

export const getFamilyTreeHandler = catchErrors(async (req, res) => {
  assertUserAndSession(req);

  const familyTree = await FamilyTreeModel.find().lean();

  return res.status(OK).json(familyTree);
});
