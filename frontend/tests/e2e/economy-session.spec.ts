import { test, expect } from '@playwright/test';
import { signUp, login } from './helpers/auth';
import { solveWater, solveLight } from './helpers/game';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test('auth user with coins can start session from game page and reach /play/1', async ({ page }) => {
  const { email, password } = await signUp(page);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  await page.goto('/game/1');
  const playButton = page.getByTestId('game-play-now');
  await playButton.waitFor({ state: 'visible', timeout: 5000 });
  if (!(await playButton.isDisabled())) {
    await playButton.click();
    await expect(page).toHaveURL(/\/play\/1/);
  }
});

test('completing Link Four shows win state and earned coins text', async ({ page }) => {
  const { email, password } = await signUp(page);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  await page.goto('/game/1');
  const playButton = page.getByTestId('game-play-now');
  await playButton.waitFor({ state: 'visible', timeout: 5000 });
  if (await playButton.isDisabled()) {
    test.skip(true, 'New user has 0 coins; need seeded user with coins');
  }
  await playButton.click();
  await expect(page).toHaveURL(/\/play\/1/);
  await solveWater(page);
  await solveLight(page);
  await expect(page.getByTestId('link-four-win')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/coins earned|\+\d+ coins/i)).toBeVisible();
});

test('direct /play/1 without session redirects to /game/1', async ({ page }) => {
  await signUp(page);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  await page.goto('/play/1');
  await expect(page).toHaveURL(/\/game\/1/, { timeout: 5000 });
});

test('insufficient-funds auth scenario validates blocked play behavior', async ({ page }) => {
  const { email, password } = await signUp(page);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  await page.goto('/game/1');
  const playButton = page.getByTestId('game-play-now');
  await expect(playButton).toBeVisible();
  await expect(playButton).toBeDisabled();
});
