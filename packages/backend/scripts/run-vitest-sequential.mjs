import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const srcDir = join(rootDir, 'src');

const isTestFile = (file) =>
  /\.(test|spec)\.(ts|js)$/.test(file) && !file.includes('.d.ts');

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, acc);
    } else if (isTestFile(entry)) {
      acc.push(relative(rootDir, full));
    }
  }
  return acc;
}

const files = walk(srcDir).sort();

if (files.length === 0) {
  console.log('No test files found.');
  process.exit(0);
}

for (const file of files) {
  console.log(`\nRunning ${file}`);
  const nodeOptions = process.env.NODE_OPTIONS || '';
  const withHeap = nodeOptions.includes('--max-old-space-size')
    ? nodeOptions
    : `${nodeOptions} --max-old-space-size=8192`.trim();

  const result = spawnSync(
    'npm',
    ['exec', '--', 'vitest', '--run', file],
    {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: withHeap,
      },
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\nAll backend unit tests passed.');
