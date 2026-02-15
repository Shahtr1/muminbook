import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'package.json');
const destination = path.join(__dirname, 'dist', 'package.json');

fs.copyFileSync(source, destination);
