const { copyFileSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const requiredFiles = [
  'index.html',
  'styles.css',
  'catalog-bootstrap.js',
  'app.js',
  'lane-guard.js',
  'metrics.js',
  'create.html',
  'private.css',
  'private.js'
];
const outputDirectories = ['dist', 'docs'];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Build failed: missing ${file}`);
}

for (const directory of outputDirectories) {
  rmSync(directory, { recursive: true, force: true });
  mkdirSync(directory, { recursive: true });
  for (const file of requiredFiles) copyFileSync(file, join(directory, file));
}

console.log(`Build complete: ${requiredFiles.length} files copied to dist/ and docs/.`);
