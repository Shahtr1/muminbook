import { PrimaryId } from "../primaryId";
import RevelationPlace from "../enums/revelationPlace";

export type Ayat = {
  uuid: number;
  surahId: PrimaryId;
  ayat: string;
  audioUrl: string;
  juzId: PrimaryId;
};

export type Surah = {
  uuid: number;
  name: string;
  transliteration: string;
  meaning: string;
  revelationPlace: RevelationPlace;
  totalAyats: number;
};
