import { BAD_REQUEST } from '../../constants/http';
import appAssert from '../../utils/appAssert';
import ResourceModel, { ResourceDocument } from '../../models/resource.model';
import { PrimaryId } from '../../constants/primaryId';

// Regex to match special characters that need to be escaped in regex patterns
// This ensures user-provided paths don't break the regex when searching for descendants
const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

export const assertNotRootFolder = (
  resource: ResourceDocument,
  message = 'Cannot modify root folder'
) => {
  const isRoot = resource.path === 'my-files' || resource.parent === null;
  appAssert(!isRoot, BAD_REQUEST, message);
};

// Renamed for clarity: returns all descendant resources under a given path for a user
export const findDescendantsByPath = async (
  parentPath: string,
  userId: PrimaryId,
  includeDeleted = true
) => {
  // Escape special regex characters in the path to prevent regex injection
  const escapedPath = parentPath.replace(REGEX_SPECIAL_CHARS, '\\$&');

  const filter: any = {
    path: new RegExp(`^${escapedPath}/`),
    userId,
  };

  if (!includeDeleted) {
    filter.deleted = false;
  }

  return ResourceModel.find(filter);
};

// Backwards-compatible alias for code that still imports the old name
export const getAllDescendants = findDescendantsByPath;
