import { test, expect } from '@playwright/test';

/**
 * Albums page: select an album to show its tracks, then go back to albums list
 */
test('albums: select album -> show tracks -> back to albums', async ({
  page,
}) => {
  await page.goto('/');

  // Navigate to Albums in the sidebar
  await page.getByText('Albums').first().click();

  // Ensure Albums header is visible
  await expect(page.getByRole('heading', { name: 'Albums' })).toBeVisible();

  // Click first album item
  const firstItem = page.locator('.group').first();
  await expect(firstItem).toBeVisible();
  await firstItem.click();

  // Back button should appear in tracks view
  const backBtn = page.getByRole('button', { name: 'Back to Albums' });
  await expect(backBtn).toBeVisible();

  // Go back to album list
  await backBtn.click();

  // A list item should be visible again
  await expect(page.locator('.group').first()).toBeVisible();
});
