import mongoose from "mongoose";
import FamilyTreeModel from "../models/family-tree.model";
import { familyTreeApi } from "../data/familyTreeApi";

const initializeFamilyTree = async () => {
  try {
    console.log("Initializing Family Tree...");

    const existingRecords = await FamilyTreeModel.countDocuments();
    if (existingRecords > 0) {
      console.log("Family tree already initialized.");
      return;
    }

    const insertedMembers = new Map<string, mongoose.Types.ObjectId>();

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
      insertedMembers.set(id, savedMember._id as mongoose.Types.ObjectId);
    }

    for (const member of familyTreeApi) {
      if (member.parents) {
        let parentsArray: mongoose.Types.ObjectId[] = [];

        if (Array.isArray(member.parents)) {
          parentsArray = member.parents
            .map((parentId) => insertedMembers.get(parentId))
            .filter(
              (parent) => parent !== undefined,
            ) as mongoose.Types.ObjectId[];
        } else {
          const parentObjectId = insertedMembers.get(member.parents);
          if (parentObjectId) parentsArray.push(parentObjectId);
        }

        await FamilyTreeModel.findOneAndUpdate(
          { uuid: member.uuid },
          { parents: parentsArray },
        );
      }
    }

    console.log("Family Tree initialized successfully.");
  } catch (error) {
    console.error("Error while initializing Family Tree:", error);
    process.exit(1);
  }
};

export default initializeFamilyTree;
