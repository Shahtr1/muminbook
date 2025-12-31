import RevelationPlace from './revelationPlace';

export type Surah = {
  uuid: number;
  name: string;
  transliteration: string;
  meaning: string;
  revelationPlace: RevelationPlace;
  totalAyat: number;
};
