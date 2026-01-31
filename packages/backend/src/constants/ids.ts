import mongoose from 'mongoose';

export type PrimaryId = mongoose.Types.ObjectId;

export type UuidMap = Map<number, PrimaryId>;
