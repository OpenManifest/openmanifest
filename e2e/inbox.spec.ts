import { createLoadViaApi, manifestMemberViaApi, takeMemberOffViaApi } from './support/api';
import { expectAccessible } from './support/a11y';
import { claim } from './support/claims';
import { expectLayout } from './support/layout';
import { press, pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// The Inbox (U4.4): the member's notifications with their read state, a row that opens what it is about, and the badge
test.describe('inbox as a fun jumper @inbox', () => {
  test.use({ role: 'jumper2' });

  test('lists what happened, opens the load a booking is on and marks it read', async ({
    page,
  }) => {
    await claim('Sam Skydiver');
    // The seed has Sam on the first load, and a member is on one load that has not left
    await takeMemberOffViaApi('Sam Skydiver');
    const id = await createLoadViaApi(`Inbox ${test.info().project.name} ${Date.now()}`);
    expect(id, 'could not create a load through the API').toBeTruthy();
    // Being manifested tells the member
    expect(await manifestMemberViaApi(id as string, 'Sam Skydiver')).toBeTruthy();

    await gotoRoute(page, '/notifications');
    const list = page.getByTestId('inbox-list');
    await expect(list).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('inbox-summary')).toContainText('unread');
    await expectLayout(page, 'inbox');
    await expectAccessible(page, 'inbox');

    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByTestId('nav-inbox-badge')).toBeVisible();
    await expect(nav.getByRole('button', { name: /Inbox, \d+ unread/ })).toBeVisible();

    // The newest unread row is the booking just made: it opens its load
    const unread = page.locator('[data-testid^="inbox-"][data-testid$="-unread"]').first();
    const rowId = (await unread.getAttribute('data-testid'))?.replace(/^inbox-|-unread$/g, '');
    await pressUntil(page, unread, () =>
      expect(page).toHaveURL(new RegExp(`/loads/${id}$`), { timeout: 5000 })
    );

    await gotoRoute(page, '/notifications');
    await expect(page.getByTestId(`inbox-${rowId}`)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId(`inbox-${rowId}-unread`)).toHaveCount(0);
  });

  test('marks everything as read and clears the badge', async ({ page }) => {
    await claim('Sam Skydiver');
    // The seed has Sam on the first load, and a member is on one load that has not left
    await takeMemberOffViaApi('Sam Skydiver');
    const id = await createLoadViaApi(`Inbox all ${test.info().project.name} ${Date.now()}`);
    expect(id, 'could not create a load through the API').toBeTruthy();
    expect(await manifestMemberViaApi(id as string, 'Sam Skydiver')).toBeTruthy();

    await gotoRoute(page, '/notifications');
    const readAll = page.getByTestId('inbox-read-all');
    await expect(readAll).toBeVisible({ timeout: 20_000 });

    await pressUntil(page, readAll, () =>
      expect(page.getByTestId('inbox-summary')).toHaveText('You are up to date', {
        timeout: 5000,
      })
    );
    await expect(readAll).toHaveCount(0);
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByTestId('nav-inbox-badge')).toHaveCount(0);
  });

  test('the bar opens the inbox', async ({ page }) => {
    await gotoRoute(page, '/today');
    const nav = page.getByRole('navigation', { name: 'Main' });

    await press(page, nav.getByRole('button', { name: /Inbox/ }));
    await expect(page).toHaveURL(/\/notifications$/);
  });
});
