import { test, expect } from '@playwright/test';

/**
 * Artists page: select an artist to show its tracks, then go back to artists list
 */
test('artists: select artist -> show tracks -> back to artists', async ({
  page,
}) => {
  await page.goto('/');

  // Navigate to Artists in the sidebar
  await page.getByText('Artists').first().click();

  // Ensure Artists header is visible
  await expect(page.getByRole('heading', { name: 'Artists' })).toBeVisible();

  // Click first artist card in the grid
  const firstCard = page.locator('div.grid .group').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  // Back button should appear in tracks view
  const backBtn = page.getByRole('button', { name: 'Back to Artists' });
  await expect(backBtn).toBeVisible();

  // Go back to artist list
  await backBtn.click();

  // Grid should be visible again
  await expect(page.locator('div.grid .group').first()).toBeVisible();
});
