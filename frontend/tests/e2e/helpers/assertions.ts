import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Assert current URL path equals expected */
export async function expectPath(page: Page, path: string) {
  const url = new URL(page.url());
  expect(url.pathname).toBe(path);
}

/** Assert page contains visible text */
export async function expectVisibleText(page: Page, text: string | RegExp) {
  await expect(page.getByText(text)).toBeVisible();
}
