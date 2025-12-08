import mongoose from "mongoose";
import VerificationCodeType from "../constants/enums/verificationCodeType";
import { PrimaryId } from "../constants/primaryId";

export interface VerificationCodeDocument extends mongoose.Document {
  userId: PrimaryId;
  type: VerificationCodeType;
  expiresAt: Date;
  createdAt: Date;
}

const verificationCodeSchema = new mongoose.Schema<VerificationCodeDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(VerificationCodeType),
    required: true,
  },
  createdAt: { type: Date, required: true, default: Date.now() },
  expiresAt: { type: Date, required: true },
});

const VerificationCodeModel = mongoose.model<VerificationCodeDocument>(
  "VerificationCode",
  verificationCodeSchema,
  "verification_codes",
);

export default VerificationCodeModel;
