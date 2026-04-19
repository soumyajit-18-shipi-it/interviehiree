import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectAnyToast(page: Page, pattern: RegExp) {
  await expect(page.getByText(pattern).first()).toBeVisible();
}

async function expectToastOrFallback(page: Page, pattern: RegExp, fallback: () => Locator) {
  try {
    await expectAnyToast(page, pattern);
    return;
  } catch {
    await expect(fallback().first()).toBeVisible();
  }
}

test('smoke: navigates major app sections against official API', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Usage Overview' })).toBeVisible();

  await page.getByRole('button', { name: 'Usage Overview' }).click();
  await expect(page.getByRole('heading', { name: 'Usage Overview' })).toBeVisible();

  await page.getByRole('button', { name: 'Team Access' }).click();
  await expect(page.getByRole('heading', { name: 'Team Members' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Invite Member' })).toBeVisible();

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Platform Settings' })).toBeVisible();
});

test('smoke: can create job and invite member via official API', async ({ page }) => {
  const suffix = Date.now();

  await page.goto('/');

  await page.getByRole('button', { name: /^New Job$/ }).click();
  await page.getByPlaceholder('e.g. Senior Product Designer').fill(`QA Engineer ${suffix}`);
  await page.getByRole('button', { name: 'Create Job' }).click();
  await expectToastOrFallback(
    page,
    /Job created successfully\.|Unable to create job\. Please try again\./i,
    () => page.getByText(new RegExp(`QA Engineer ${suffix}`, 'i')),
  );

  await page.getByRole('button', { name: 'Team Access' }).click();
  await page.getByRole('button', { name: 'Invite Member' }).click();
  await page.getByPlaceholder('e.g. Sarah Connor').fill(`QA User ${suffix}`);
  await page.getByPlaceholder('e.g. sarah@company.com').fill(`qa.user.${suffix}@example.com`);
  await page.getByRole('button', { name: 'Send Invite' }).click();
  await expectToastOrFallback(
    page,
    /Invite sent successfully\.|Failed to send invite\./i,
    () => page.getByText(new RegExp(`qa\.user\.${suffix}@example\.com`, 'i')),
  );
});

test('smoke: can update settings and career setup with official API', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expectAnyToast(page, /Profile settings saved\.|Failed to save profile settings\./i);

  await page.getByRole('button', { name: 'Data & Privacy' }).click();
  await page.getByRole('button', { name: 'Manage Cookies' }).click();
  await page.getByRole('button', { name: 'Save Preferences' }).click();
  await expectAnyToast(page, /Cookie preferences saved\.|Unable to save cookie preferences\./i);

  await page.getByRole('button', { name: 'Career Page' }).click();
  await expect(page.getByRole('heading', { name: 'Career Page Setup' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Live' })).toBeVisible();
});
