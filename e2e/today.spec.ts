import {
  createLoadViaApi,
  giveLastSlotViaApi,
  manifestMemberViaApi,
  ownerCall,
  setSelfManifestViaApi,
  takeMemberOffViaApi,
} from './support/api';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { claim } from './support/claims';
import { press, pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

// Today (U4.1): where a member lands, with the load they fly next, whether they are ready, their credit and the day
test.describe('today as a fun jumper @today', () => {
  test.use({ role: 'jumper' });

  test('is where a jumper lands, with their load, whether they are ready and their credit', async ({
    page,
  }) => {
    await gotoRoute(page, '/');
    await expect(page).toHaveURL(/\/today$/, { timeout: 20_000 });

    const next = page.getByTestId('today-next-load');
    await expect(next).toBeVisible({ timeout: 20_000 });
    await expect(next).toContainText('Load #1');
    await expect(page.getByTestId('today-ready')).toBeVisible();
    await expect(page.getByTestId('today-credit')).toBeVisible();
    await expect(page.getByTestId('today-loads')).toBeVisible();
    await expectLayout(page, 'today');
    await expectAccessible(page, 'today');
  });

  test('finds their load and takes themselves off it', async ({ page }) => {
    await claim('Jo Jumper');
    await gotoRoute(page, '/today');
    const next = page.getByTestId('today-next-load');
    await expect(next).toContainText('Load #1', { timeout: 20_000 });

    try {
      await press(page, page.getByTestId('today-next-load-take-off'));
      await expect(page.getByTestId('today-next-load')).toBeHidden({ timeout: 15_000 });
    } finally {
      // The seed has Jo Jumper on the first load: put them back for the specs that follow
      const loads = await ownerCall('{ operators { edges { node { id } } } }');
      const operator = loads.json.data.operators.edges[0].node.id;
      const first = await ownerCall(
        `{ loads(operator: ${operator}, first: 20) { edges { node { id loadNumber } } } }`
      );
      const seeded = first.json.data.loads.edges
        .map((edge: { node: { id: string; loadNumber: number } }) => edge.node)
        .find((load: { loadNumber: number }) => load.loadNumber === 1);
      if (seeded) await manifestMemberViaApi(seeded.id, 'Jo Jumper');
    }
  });
});

test.describe('today as a student @today', () => {
  test.use({ role: 'student' });

  test('asks them to see the manifest desk instead of offering to take them off', async ({
    page,
  }) => {
    await claim('Stu Student');
    const id = await createLoadViaApi(`Today ${test.info().project.name} ${Date.now()}`);
    expect(id, 'could not create a load through the API').toBeTruthy();
    expect(await manifestMemberViaApi(id as string, 'Stu Student')).toBeTruthy();

    await gotoRoute(page, '/today');
    const next = page.getByTestId('today-next-load');
    await expect(next).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('today-next-load-desk')).toBeVisible();
    await expect(page.getByTestId('today-next-load-take-off')).toHaveCount(0);
  });
});

// Self-booking (U4.2): a member books themselves from Today with the picker in self mode
test.describe('booking myself @today @board', () => {
  test.describe('as a fun jumper', () => {
    test.use({ role: 'jumper2' });

    test('books a jump from Today in two interactions, with their last slot filled in', async ({
      page,
    }) => {
      await claim('Sam Skydiver');
      // The seed has Sam on the first load: take them off, and make sure they have flown before, so there is a last slot
      await takeMemberOffViaApi('Sam Skydiver');
      expect(await giveLastSlotViaApi('Sam Skydiver')).toBe(true);

      await gotoRoute(page, '/today');
      const book = page.getByTestId('today-book-action');
      await expect(book).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId('today-next-load')).toHaveCount(0);

      // 1: "Book a jump" opens the picker with Sam in it; 2: the confirm button
      await pressUntil(page, book, () =>
        expect(page.getByTestId('today-book-action-picker')).toBeVisible({ timeout: 5000 })
      );
      const picker = page.getByTestId('today-book-action-picker');
      await expect(picker.getByTestId('picker-row')).toHaveCount(1);
      await expect(picker.getByTestId('today-book-action-picker-search')).toHaveCount(0);
      const add = picker.getByTestId('today-book-action-picker-add');
      await expect(add).toBeEnabled({ timeout: 20_000 });
      await expect(add).toContainText('Book Load #');
      await expectAccessible(page, 'self-booking picker');
      await press(page, add);

      await expect(page.getByTestId('today-next-load')).toBeVisible({ timeout: 20_000 });
      await expect(page.getByTestId('today-book')).toHaveCount(0);
    });
  });

  test.describe('from the board', () => {
    test.use({ role: 'jumper2' });

    test('a member books from the card of a load', async ({ page }) => {
      await claim('Sam Skydiver');
      const id = await createLoadViaApi(`Book ${test.info().project.name} ${Date.now()}`);
      expect(id, 'could not create a load through the API').toBeTruthy();

      await gotoRoute(page, '/manifest');
      const book = page.getByTestId(`book-jump-${id}`);
      await expect(book).toBeVisible({ timeout: 20_000 });
      // The new load is below the others on a phone
      await book.scrollIntoViewIfNeeded();
      await pressUntil(page, book, () =>
        expect(page.getByTestId(`book-jump-${id}-picker`)).toBeVisible({ timeout: 5000 })
      );
      await expect(page.getByTestId(`book-jump-${id}-picker-add`)).toContainText('Book Load #');
    });
  });

  test.describe('where the dropzone switched self-manifesting off', () => {
    test.use({ role: 'jumper2' });

    test('has no entry points: Today and the board leave the booking to the desk', async ({
      page,
    }) => {
      await claim('Sam Skydiver');
      const id = await createLoadViaApi(`Desk ${test.info().project.name} ${Date.now()}`);
      expect(id, 'could not create a load through the API').toBeTruthy();

      expect(await setSelfManifestViaApi(false)).toBe(true);
      try {
        await gotoRoute(page, '/today');
        await expect(page.getByTestId('today-loads')).toBeVisible({ timeout: 20_000 });
        await expect(page.getByTestId('today-book')).toHaveCount(0);

        await gotoRoute(page, '/manifest');
        await expect(page.getByTestId('load-card').first()).toBeVisible({ timeout: 20_000 });
        await expect(page.locator('[data-testid^="book-jump-"]')).toHaveCount(0);
      } finally {
        expect(await setSelfManifestViaApi(true)).toBe(true);
      }
    });
  });
});
