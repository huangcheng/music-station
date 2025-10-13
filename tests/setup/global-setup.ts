import { chromium, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string | undefined;
  const authDir = path.resolve(__dirname, '../../.auth');
  const storagePath = path.join(authDir, 'admin.json');

  fs.mkdirSync(authDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to app root (will redirect to /login)
  await page.goto(baseURL ?? 'http://localhost:3000/');
  await page.waitForURL('**/login');

  // Fill and submit login form (seeded admin/admin)
  const form = page.getByTestId('login-form');
  await form.getByTestId('name-input').fill('admin');
  await form.getByTestId('password-input').fill('admin');
  await form.getByTestId('submit-button').click();

  await page.waitForURL(baseURL ? `${baseURL}` : 'http://localhost:3000/');

  await context.storageState({ path: storagePath });
  await browser.close();
}
