import RevelationPlace from "../constants/enums/revelationPlace";

export type Surah = {
  uuid: number;
  name: string;
  transliteration: string;
  meaning: string;
  revelationPlace: RevelationPlace;
  totalAyats: number;
};
