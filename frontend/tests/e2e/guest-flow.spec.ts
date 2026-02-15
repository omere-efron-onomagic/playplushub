import { test, expect } from '@playwright/test';
import { solveWater, solveLight } from './helpers/game';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test('guest can play /play/1, finish puzzle, and see guest reward/win UX', async ({ page }) => {
  await page.goto('/play/1');
  await expect(page).toHaveURL(/\/play\/1/);
  await expect(page.getByText(/level 1\/10|level \d+\/10/i)).toBeVisible();
  await solveWater(page);
  await solveLight(page);
  await expect(page.getByTestId('link-four-win')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/coins earned|\+\d+ coins/i)).toBeVisible();
});
