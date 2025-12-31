import FamilyTreeModel from '../../models/family-tree.model';
import { familyTreeApi, FamilyTreeEntry } from '../../data/familyTreeApi';
import { PrimaryId } from '../../constants/primaryId';
import { log } from '../../utils/log';

/**
 * Return document count of FamilyTree collection.
 */
const countExisting = async (): Promise<number> => {
  return FamilyTreeModel.countDocuments();
};

/**
 * Insert all members from API into DB and return a map of api id -> inserted _id.
 */
const insertMembers = async (
  members: FamilyTreeEntry[]
): Promise<Map<string, PrimaryId>> => {
  const map = new Map<string, PrimaryId>();

  for (const member of members) {
    const doc = new FamilyTreeModel({
      uuid: member.uuid,
      biblicalName: member.biblicalName ?? null,
      islamicName: member.islamicName ?? null,
      arabicName: member.arabicName ?? null,
      lineages: member.lineages,
      label: member.label ?? null,
    });

    const saved = await doc.save();
    map.set(member.id, saved._id as PrimaryId);
  }

  return map;
};

/**
 * Link parents for members using the inserted id map. Returns number of members processed for linking.
 */
const linkParents = async (
  members: FamilyTreeEntry[],
  idMap: Map<string, PrimaryId>
): Promise<number> => {
  let linkedCount = 0;

  for (const member of members) {
    if (!member.parents) continue;

    const parentsArray: PrimaryId[] = Array.isArray(member.parents)
      ? member.parents
          .map((pid) => idMap.get(pid))
          .filter((p): p is PrimaryId => p !== undefined)
      : idMap.get(member.parents)
        ? [idMap.get(member.parents) as PrimaryId]
        : [];

    await FamilyTreeModel.findOneAndUpdate(
      { uuid: member.uuid },
      { parents: parentsArray }
    );
    linkedCount++;
  }

  return linkedCount;
};

/**
 * Initialize family tree: insert members then link parents.
 */
const initializeFamilyTree = async (): Promise<void> => {
  try {
    log.debug('🌳 Initializing Family Tree...');

    const existing = await countExisting();
    if (existing > 0) {
      log.info(`Family Tree already initialized with ${existing} entries.`);
      return;
    }

    const insertedMap = await insertMembers(familyTreeApi as FamilyTreeEntry[]);
    log.info(`Inserted ${insertedMap.size} family tree members.`);

    const linked = await linkParents(
      familyTreeApi as FamilyTreeEntry[],
      insertedMap
    );
    log.info(`Linked parent relationships for ${linked} members.`);

    console.log('🎉 Family Tree initialized successfully.');
  } catch (err) {
    log.error('Error while initializing Family Tree:', err);
    process.exit(1);
  }
};

export default initializeFamilyTree;
