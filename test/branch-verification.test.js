const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

for (const file of ['index.html', 'styles.css', 'app.js', 'metrics.js']) {
  test(`${file} matches repository preview output`, () => {
    assert.equal(readFileSync(file, 'utf8'), readFileSync(`docs/${file}`, 'utf8'));
  });
}
