import { test, expect } from '@playwright/test';

const locales = ['ar', 'en', 'tr'];

for (const locale of locales) {
  test(`${locale}: game boots, renders and accepts touch input`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    await page.goto('./', { waitUntil: 'networkidle' });
    await page.locator('#language-select').selectOption(locale);
    await page.locator('#open-button').click();
    await expect(page.locator('[data-screen="instructions"]')).toBeVisible();
    await page.locator('#start-button').click();

    const arena = page.locator('#rift-arena');
    await expect(arena).toBeVisible();
    await expect(page.locator('#phaser-game canvas')).toBeVisible({ timeout: 15_000 });

    const fit = await page.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      arena: document.querySelector('#rift-arena')?.getBoundingClientRect(),
      viewport: { width: innerWidth, height: innerHeight }
    }));
    expect(fit.horizontalOverflow).toBeLessThanOrEqual(1);
    expect(fit.arena.bottom).toBeLessThanOrEqual(fit.viewport.height + 1);
    expect(fit.arena.width).toBeGreaterThan(250);
    expect(fit.arena.height).toBeGreaterThan(250);

    const box = await arena.boundingBox();
    expect(box).not.toBeNull();
    const x = box.x + box.width * 0.45;
    const y = box.y + box.height * 0.62;

    await page.touchscreen.tap(x, y);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y - 90, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.mouse.move(x, y - 40);
    await page.mouse.down();
    await page.mouse.move(x, y + 90, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(1200);

    await expect(page.locator('#score-value')).toHaveText(/\d+/);
    await expect(page.locator('#lives-value')).toHaveText(/[0-3]/);
    await expect(page.locator('#phaser-game canvas')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
