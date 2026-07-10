const { copyFileSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const requiredFiles = ['index.html', 'app.js'];
const distDir = 'dist';

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`Build failed: required file is missing: ${file}`);
  }
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const file of requiredFiles) {
  copyFileSync(file, join(distDir, file));
}

console.log(`Build completed: ${requiredFiles.join(', ')} copied to ${distDir}/`);
