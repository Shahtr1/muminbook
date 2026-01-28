const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://quranenc.com/api/v1/translation/sura/english_saheeh';

async function generate() {
  let globalUuid = 1;

  const outputDir = path.join(__dirname, 'sahih_json');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (let surah = 1; surah <= 114; surah++) {
    console.log(`Fetching Surah ${surah}...`);

    const response = await axios.get(`${BASE_URL}/${surah}`);

    if (!response.data.result) {
      throw new Error(`Invalid response for surah ${surah}`);
    }

    const ayahs = response.data.result;

    const formatted = ayahs.map((ayah) => {
      return {
        uuid: globalUuid++,
        ayah: ayah.translation,
        footnotes: ayah.footnotes || '',
      };
    });

    const fileName = `surah_${String(surah).padStart(3, '0')}.json`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(formatted, null, 2), 'utf8');

    console.log(`Saved ${fileName}`);
  }

  console.log('All surahs generated successfully.');
  console.log(`Total ayahs processed: ${globalUuid - 1}`);
}

generate().catch((err) => {
  console.error('Error:', err.message);
});
