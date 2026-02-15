import fs from 'fs';
import path from 'path';

export const loadJSONFiles = (relativePath: string): any[] => {
  const dir = path.resolve(process.cwd(), relativePath);

  if (!fs.existsSync(dir)) {
    throw new Error(`Directory not found: ${dir}`);
  }

  const files = fs.readdirSync(dir).sort();

  return files
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => {
      const filePath = path.join(dir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return Array.isArray(content) ? content : [content];
    });
};
