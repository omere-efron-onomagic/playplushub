import { Page } from '@playwright/test';

/** Solve a Link Four level by clicking letter buttons to spell the answer */
export async function solveLinkFourLevel(page: Page, answer: string) {
  for (const letter of answer) {
    await page.getByTestId(new RegExp(`^letter-bank-${letter}-\\d+$`)).first().click();
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1500);
}

/** Solve WATER (level 1) */
export async function solveWater(page: Page) {
  return solveLinkFourLevel(page, 'WATER');
}

/** Solve LIGHT (level 2) */
export async function solveLight(page: Page) {
  return solveLinkFourLevel(page, 'LIGHT');
}
