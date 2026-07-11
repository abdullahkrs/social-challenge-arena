const { copyFileSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const requiredFiles = ['index.html', 'styles.css', 'app.js', 'metrics.js'];
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
