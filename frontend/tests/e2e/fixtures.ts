import { test as base } from '@playwright/test';

/** Extend base test: clear storage before each test, standard viewport */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.setViewportSize({ width: 1280, height: 720 });
    await use(page);
  },
});

export { expect } from '@playwright/test';
