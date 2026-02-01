import fs from 'fs';
import fetch from 'node-fetch';

const API_URL = 'http://api.alquran.cloud/v1/surah';

const RevelationPlace = {
  Meccan: 'RevelationPlace.Mecca',
  Medinan: 'RevelationPlace.Medina',
};

async function generate() {
  const response = await fetch(API_URL);
  const json = await response.json();

  if (!json || json.code !== 200 || !json.data) {
    throw new Error('Invalid API response');
  }

  const transformed = json.data.map((surah) => ({
    uuid: surah.number,
    name: surah.name,
    transliteration: surah.englishName,
    meaning: surah.englishNameTranslation,
    revelationPlace:
      RevelationPlace[surah.revelationType] || 'RevelationPlace.Mecca',
    totalAyat: surah.numberOfAyahs,
  }));

  const fileContent = `export const surahs = ${JSON.stringify(
    transformed,
    null,
    2
  )};\n`;

  fs.writeFileSync('./surahs.js', fileContent);

  console.log('surahs.js generated successfully.');
}

generate();
