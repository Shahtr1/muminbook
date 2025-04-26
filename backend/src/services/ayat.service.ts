import { PrimaryId } from "../constants/primaryId";

export type Ayat = {
  uuid: number;
  surahId: PrimaryId;
  ayat: string;
  audioUrl: string;
  juzId: PrimaryId;
};
