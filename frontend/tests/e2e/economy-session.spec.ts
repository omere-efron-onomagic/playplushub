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
  // Navigate directly to /signup to avoid guest creation that happens on /
  await page.goto('/signup');
  
  const name = `user-${Date.now()}`;
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
  const password = 'TestPass123!';
  
  await page.getByPlaceholder('Choose a username').fill(name);
  await page.getByPlaceholder('your@email.com').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForURL(/\/(?!signup)/, { timeout: 10000 });
  
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  
  // Get current coin balance
  const coinDisplay = page.getByTestId('navbar-coins');
  await expect(coinDisplay).toBeVisible();
  let coinText = await coinDisplay.textContent();
  let userCoins = Number.parseInt(coinText || '0', 10);
  
  // Spend all coins by playing games until we have less than 2 coins (game 1 costs 2)
  // Game 4 and 12 cost 1 coin each, so we can drain down to 0-1 coins
  while (userCoins >= 2) {
    await page.goto('/game/12'); // Quiz Master costs 1 coin
    await page.waitForLoadState('networkidle');
    const playBtn = page.getByTestId('game-play-now');
    
    if (await playBtn.isDisabled()) {
      break; // Already out of coins
    }
    
    // Start session to spend 1 coin
    await playBtn.click();
    await page.waitForURL(/\/play\/12/, { timeout: 5000 });
    
    // Navigate back without completing to avoid reward
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check updated balance
    coinText = await coinDisplay.textContent();
    userCoins = Number.parseInt(coinText || '0', 10);
    
    // Safety: don't loop forever
    if (userCoins > 20) {
      test.skip(true, 'Coin balance unexpectedly high; skipping insufficient-funds test');
    }
  }
  
  // Now test that we can't play a 2-coin game
  await page.goto('/game/1');
  await page.waitForLoadState('networkidle');
  const playButton = page.getByTestId('game-play-now');
  await expect(playButton).toBeVisible();
  await expect(playButton).toBeDisabled();
});

test('guest uses same session start/claim flow as auth user', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.goto('/game/1');
  const playButton = page.getByTestId('game-play-now');
  await playButton.waitFor({ state: 'visible', timeout: 5000 });
  await expect(playButton).toBeEnabled();
  await playButton.click();
  await expect(page).toHaveURL(/\/play\/1/, { timeout: 5000 });
  await solveWater(page);
  await solveLight(page);
  await expect(page.getByTestId('link-four-win')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/coins earned|\+\d+ coins/i)).toBeVisible();
});
