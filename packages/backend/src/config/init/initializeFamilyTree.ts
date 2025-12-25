import FamilyTreeModel from '../../models/family-tree.model';
import { familyTreeApi } from '../../data/familyTreeApi';
import { PrimaryId } from '../../constants/primaryId';

const initializeFamilyTree = async () => {
  try {
    console.log('🌳 Initializing Family Tree...');

    const existingRecords = await FamilyTreeModel.countDocuments();
    if (existingRecords > 0) {
      console.log(
        `ℹ️ Family Tree already initialized with ${existingRecords} entries.`
      );
      return;
    }

    const insertedMembers = new Map<string, PrimaryId>();

    // First pass: insert members
    for (const member of familyTreeApi) {
      const {
        id,
        uuid,
        biblicalName,
        islamicName,
        arabicName,
        lineages,
        label,
      } = member;

      const newMember = new FamilyTreeModel({
        uuid,
        biblicalName: biblicalName || null,
        islamicName: islamicName || null,
        arabicName: arabicName || null,
        lineages,
        label: label || null,
      });

      const savedMember = await newMember.save();
      insertedMembers.set(id, savedMember._id as PrimaryId);
    }

    console.log(`✅ Inserted ${insertedMembers.size} family tree members.`);

    // Second pass: link parents
    let linkedCount = 0;

    for (const member of familyTreeApi) {
      if (member.parents) {
        let parentsArray: PrimaryId[] = [];

        if (Array.isArray(member.parents)) {
          parentsArray = member.parents
            .map((parentId) => insertedMembers.get(parentId))
            .filter((parent) => parent !== undefined) as PrimaryId[];
        } else {
          const parentObjectId = insertedMembers.get(member.parents);
          if (parentObjectId) parentsArray.push(parentObjectId);
        }

        await FamilyTreeModel.findOneAndUpdate(
          { uuid: member.uuid },
          { parents: parentsArray }
        );
        linkedCount++;
      }
    }

    console.log(`🔗 Linked parent relationships for ${linkedCount} members.`);
    console.log('🎉 Family Tree initialized successfully.');
  } catch (error) {
    console.error('❌ Error while initializing Family Tree:', error);
    process.exit(1);
  }
};

export default initializeFamilyTree;
