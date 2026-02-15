import RevelationPlace from './revelationPlace.js';

export type Surah = {
  uuid: number;
  name: string;
  transliteration: string;
  meaning: string;
  revelationPlace: RevelationPlace;
  totalAyat: number;
};
