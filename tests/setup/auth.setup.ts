import { test as setup } from '@playwright/test';
import fs from 'node:fs';

const STORAGE_STATE = '.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // Ensure auth dir exists
  fs.mkdirSync('.auth', { recursive: true });

  // Go to home -> should redirect to /login
  await page.goto('/');

  // Fill login form (seeded admin/admin)
  const form = page.getByTestId('login-form');
  await form.getByTestId('name-input').fill('admin');
  await form.getByTestId('password-input').fill('admin');
  await form.getByTestId('submit-button').click();

  // Wait to land on home
  await page.waitForURL('/');

  // Save signed-in state to reuse in other projects
  await page.context().storageState({ path: STORAGE_STATE });
});
