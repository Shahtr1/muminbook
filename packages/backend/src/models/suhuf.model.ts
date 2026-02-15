import mongoose from 'mongoose';
import { PrimaryId } from '../constants/ids.js';
import FileType from '../constants/types/fileType.js';
import Direction from '../constants/types/direction.js';

type ReadingLayout = {
  id: string;
  sidebar?: string;
  sidebarOpen?: boolean;
};

export interface SuhufDocument extends mongoose.Document {
  userId: PrimaryId;
  title: string;
  config: {
    panels: {
      fileId?: string;
      fileType: FileType;
      scrollPosition?: number;
      active: boolean;
      direction: Direction;
    }[];
    layout?: {
      leftTab?: string;
      isLeftTabOpen: boolean;
      bottomTab?: string;
      isBottomTabOpen: boolean;
      reading: ReadingLayout[];
      leftReadingTab?: string;
      leftReadingTabOpen?: boolean;
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
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Suhuf',
    },
    config: {
      type: Object,
      default: {
        panels: [
          {
            fileType: FileType.None,
            active: true,
            direction: Direction.Left,
          },
          {
            fileType: FileType.None,
            active: false,
            direction: Direction.Right,
          },
        ],
      },
    },
  },
  { timestamps: true }
);

const SuhufModel = mongoose.model<SuhufDocument>('Suhuf', suhufSchema, 'Suhuf');

export default SuhufModel;
