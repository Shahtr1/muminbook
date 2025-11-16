import fs from "fs";
import path from "path";

export const loadQuran = (): any[] => {
  const ayatDir = path.join(__dirname, "../data/surahs");
  const files = fs.readdirSync(ayatDir);

  let allAyats: any[] = [];
  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(ayatDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
      allAyats = allAyats.concat(content);
    }
  }

  return allAyats;
};
