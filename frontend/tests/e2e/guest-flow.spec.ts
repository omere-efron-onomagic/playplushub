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

test('guest can start session from game page, play, and see reward/win UX', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.goto('/game/1');
  const playButton = page.getByTestId('game-play-now');
  await playButton.waitFor({ state: 'visible', timeout: 5000 });
  await expect(playButton).toBeEnabled();
  await playButton.click();
  await expect(page).toHaveURL(/\/play\/1/, { timeout: 5000 });
  await expect(page.getByText(/level 1\/10|level \d+\/10/i)).toBeVisible();
  await solveWater(page);
  await solveLight(page);
  await expect(page.getByTestId('link-four-win')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/coins earned|\+\d+ coins/i)).toBeVisible();
});

test('guest without session token redirects from /play/1 to /game/1', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.goto('/play/1');
  await expect(page).toHaveURL(/\/game\/1/, { timeout: 5000 });
});
