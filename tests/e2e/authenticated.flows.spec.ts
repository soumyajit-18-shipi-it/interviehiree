import { expect, test } from '@playwright/test';

const apiBase = (process.env.VITE_API_BASE_URL ?? 'https://dhruvshah2706.pythonanywhere.com').replace(/\/$/, '');

test('authenticated flow sends authorization header to official API', async ({ page }) => {
  const authorizationHeaders: string[] = [];

  page.on('request', (request) => {
    if (!request.url().startsWith(apiBase)) {
      return;
    }

    const authorization = request.headers().authorization;
    if (authorization) {
      authorizationHeaders.push(authorization);
    }
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();
  await expect.poll(() => authorizationHeaders.length).toBeGreaterThan(0);
  expect(authorizationHeaders.some((header) => header.startsWith('Basic '))).toBeTruthy();
});

test('authenticated flow can access protected team page via official API', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Team Access' }).click();
  await expect(page.getByRole('heading', { name: 'Team Members' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Invite Member' })).toBeVisible();
});
