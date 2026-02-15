import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test('loads home successfully', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /game vending machine/i })).toBeVisible();
});

test('navbar links navigate correctly', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.getByTestId('nav-machine').click();
  await expect(page).toHaveURL(/\//);

  await page.getByTestId('nav-favorites').click();
  await expect(page).toHaveURL(/\/favorites/);

  await page.getByTestId('nav-trending').click();
  await expect(page).toHaveURL(/\/trending/);

  await page.getByTestId('nav-avatar-shop').click();
  await expect(page).toHaveURL(/\/avatar-shop/);
});

test('game card click opens game page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /4 pics 1 word/i }).first().click();
  await expect(page).toHaveURL(/\/game\/1/);
  await expect(page.getByText(/4 pics 1 word/i)).toBeVisible();
});
