import mongoose from "mongoose";
import { PrimaryId } from "../constants/primaryId";
import FileType from "../constants/enums/fileType";
import Direction from "../constants/enums/direction";

export interface SuhufDocument extends mongoose.Document {
  userId: PrimaryId;
  title: string;
  config: {
    panels: {
      fileId: string;
      fileType: FileType;
      scrollPosition: number;
      isActive: boolean;
      direction: Direction;
    }[];
    layout?: {
      leftTab?: string;
      isLeftTabOpen: boolean;
      bottomTab?: string;
      isBottomTabOpen: boolean;
      isSplit?: boolean;
      splitRatio: number[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const suhufSchema = new mongoose.Schema<SuhufDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Suhuf",
    },
    config: {
      type: Object,
    },
  },
  { timestamps: true },
);

const SuhufModel = mongoose.model<SuhufDocument>("Suhuf", suhufSchema, "Suhuf");

export default SuhufModel;
