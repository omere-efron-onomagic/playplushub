import { Page } from '@playwright/test';

/** Generate unique email for this run to avoid collisions */
export function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@example.com`;
}

/** Sign up with unique email; returns credentials for later login */
export async function signUp(page: Page, overrides?: { name?: string; email?: string; password?: string }) {
  const name = overrides?.name ?? `user-${Date.now()}`;
  const email = overrides?.email ?? uniqueEmail();
  const password = overrides?.password ?? 'TestPass123!';
  await page.goto('/signup');
  await page.getByPlaceholder('Choose a username').fill(name);
  await page.getByPlaceholder('your@email.com').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForURL(/\/(?!signup)/, { timeout: 10000 });
  return { name, email, password };
}

/** Log in with given credentials */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('your@email.com').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /enter the vault/i }).click();
  await page.waitForURL(/\/(?!login)/, { timeout: 10000 });
}
