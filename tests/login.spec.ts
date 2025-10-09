import { test, expect } from '@playwright/test';

test('unauthed redirect', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/login');
});

test('auth', async ({ page }) => {
  await page.goto('/');

  await page.waitForURL('/login');

  const form = page.getByTestId('login-form');

  await expect(form).toBeVisible();

  await form.getByTestId('name-input').fill('admin');
  await form.getByTestId('password-input').fill('admin');

  await form.getByTestId('submit-button').click();

  await page.waitForURL('/');
});
