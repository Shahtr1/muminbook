import mongoose, { Document, Schema } from 'mongoose';
import { PrimaryId } from '../../constants/primaryId';

export interface SahihI11lDocument extends Document {
  uuid: number;
  quranId: PrimaryId;
  ayah: string;
  footnotes: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const sahihI11lSchema = new Schema<SahihI11lDocument>(
  {
    uuid: {
      type: Number,
      required: true,
    },
    quranId: {
      type: Schema.Types.ObjectId,
      ref: 'Quran',
      required: true,
    },
    ayah: {
      type: String,
      required: true,
    },
    footnotes: {
      type: Map,
      of: String,
      required: true,
      default: {},
    },
  },
  { timestamps: true }
);

sahihI11lSchema.index({ uuid: 1 }, { unique: true });
sahihI11lSchema.index({ quranId: 1 });

const SahihI11lModel = mongoose.model<SahihI11lDocument>(
  'SahihI11l',
  sahihI11lSchema,
  'sahih_international'
);

export default SahihI11lModel;
