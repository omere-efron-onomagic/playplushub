import { test, expect } from '@playwright/test';
import { signUp, login } from './helpers/auth';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
});

test('sign-up happy path', async ({ page }) => {
  const { email } = await signUp(page);
  await expect(page).toHaveURL(/\/(?!signup|login)/);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
});

test('login happy path', async ({ page }) => {
  const { email, password } = await signUp(page);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await login(page, email, password);
  await expect(page).toHaveURL(/\/(?!login)/);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
});

test('sign-out returns guest state cues', async ({ page }) => {
  const { email } = await signUp(page);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
});
