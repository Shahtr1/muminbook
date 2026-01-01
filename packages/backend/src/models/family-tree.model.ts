import mongoose, { Document, Schema } from 'mongoose';
import LineageType from '../constants/types/lineageType';
import { PrimaryId } from '../constants/primaryId';

export interface FamilyTreeDocument extends Document {
  uuid: string;

  biblicalName?: string;
  islamicName?: string;
  arabicName?: string;
  lineages: LineageType | LineageType[];
  parents?: PrimaryId[];
  label?: string;
}

const familyTreeSchema = new Schema<FamilyTreeDocument>({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  biblicalName: {
    type: String,
    default: null,
  },
  islamicName: {
    type: String,
    default: null,
  },
  arabicName: {
    type: String,
    default: null,
  },
  lineages: {
    type: [String],
    required: true,
  },
  label: {
    type: String,
    default: null,
  },
  parents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyTree',
    },
  ],
});

const FamilyTreeModel = mongoose.model<FamilyTreeDocument>(
  'FamilyTree',
  familyTreeSchema,
  'family_tree'
);

export default FamilyTreeModel;
