import mongoose, { Document, Schema } from 'mongoose';

export interface QuranAudioDocument extends Document {
  uuid: number; // references Quran.uuid
  reciter: string;
  audioUrl: string;
}

const quranAudioSchema = new Schema<QuranAudioDocument>({
  uuid: { type: Number, required: true },
  reciter: { type: String, required: true },
  audioUrl: { type: String, required: true },
});

// Prevent duplicate reciter per ayah
quranAudioSchema.index({ uuid: 1, reciter: 1 }, { unique: true });

// Fast loading by ayah
quranAudioSchema.index({ uuid: 1 });

const QuranAudioModel = mongoose.model<QuranAudioDocument>(
  'QuranAudio',
  quranAudioSchema,
  'quran_audio'
);

export default QuranAudioModel;
