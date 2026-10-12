import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { expect, gotoRoute, test } from './support/test';

// The component gallery (dev and CI builds): every `app/ui` component in every state, one section per component. Axe and
// layout run on every section at every size; screenshots only with GALLERY_SHOTS=1 in the `full` projects (the baselines
// are made at the checkpoint, U2.8).
const SECTIONS = [
  'text',
  'button',
  'icon-button',
  'list-row',
  'layout',
  'status-badge',
  'avatar',
  'empty-state',
  'countdown',
  'tabs',
  'skeleton',
  'progress',
  'banner',
  'toast',
  'overlay',
  'menu',
  'popover',
  'tooltip',
  'text-field',
  'number-field',
  'select',
  'segmented',
  'switch',
  'chip',
];

/** The gallery route, in the words of the project's template (the generic project asks for the generic template) */
function galleryUrl(query = '') {
  const generic = test.info().project.metadata.variant === 'generic';
  const params = [query, generic ? 'industry=generic' : ''].filter(Boolean).join('&');
  return `/__gallery${params ? `?${params}` : ''}`;
}

test.describe('component gallery @gallery', () => {
  for (const id of SECTIONS) {
    test(`${id} lays out and is accessible`, async ({ page }, testInfo) => {
      await gotoRoute(page, galleryUrl(`section=${id}`));
      const section = page.getByTestId(`gallery-${id}`);

      await expect(section).toBeVisible();
      await expect(section.getByRole('heading', { level: 2 }).first()).toBeVisible();
      await expectLayout(page, `gallery ${id}`);
      await expectAccessible(page, `gallery:${id}`);

      // The gallery shows no word that comes from an operator's terms yet, so the generic variant would repeat the images
      if (
        process.env.GALLERY_SHOTS &&
        testInfo.project.metadata.group === 'full' &&
        testInfo.project.metadata.variant !== 'generic'
      ) {
        await expect(section).toHaveScreenshot(`gallery-${id}.png`, {
          animations: 'disabled',
          maxDiffPixelRatio: 0.05,
          caret: 'hide',
          // The clocks tick and the skeletons pulse
          mask: [page.locator('[data-testid^="gallery-clock"], [data-testid^="gallery-skeleton"]')],
        });
      }
    });
  }

  test('the whole gallery lays out and is accessible', async ({ page }) => {
    await gotoRoute(page, galleryUrl());

    await expect(page.getByRole('heading', { name: 'Gallery', level: 1 })).toBeVisible();
    for (const id of SECTIONS) {
      await expect(page.getByTestId(`gallery-${id}`)).toHaveCount(1);
    }
    await expectLayout(page, 'gallery');
    await expectAccessible(page, 'gallery');
  });

  test('the scheme and the density follow the query', async ({ page }) => {
    await gotoRoute(page, galleryUrl('section=button&scheme=dark&density=comfortable'));
    const dark = await page
      .getByTestId('gallery')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const save = page.getByRole('button', { name: 'Save' }).first();
    const comfortable = (await save.boundingBox())?.height ?? 0;

    await gotoRoute(page, galleryUrl('section=button&scheme=light&density=compact'));
    const light = await page
      .getByTestId('gallery')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const compact =
      (await page.getByRole('button', { name: 'Save' }).first().boundingBox())?.height ?? 0;

    expect(dark).not.toBe(light);
    expect(comfortable).toBeGreaterThan(compact);
    await expectAccessible(page, 'gallery:button:dark');
  });

  test('tabs move with the arrow keys and the panel follows', async ({ page }) => {
    await gotoRoute(page, galleryUrl('section=tabs'));
    const jumps = page.getByRole('tab', { name: 'Jumps' });

    await expect(jumps).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('The jumps panel');
    await jumps.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Gear' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('The gear panel');
    // The disabled tab is skipped: the next one wraps to the first
    await page.keyboard.press('ArrowRight');
    await expect(jumps).toHaveAttribute('aria-selected', 'true');
  });

  test('the countdown counts and tells readers once a minute', async ({ page }) => {
    await gotoRoute(page, galleryUrl('section=countdown'));
    const clock = page
      .getByTestId('gallery-countdown')
      .getByText(/^\d\d:\d\d$/)
      .first();

    await expect(clock).toBeVisible();
    const before = await clock.textContent();
    await page.waitForTimeout(2200);
    expect(await clock.textContent()).not.toBe(before);
    await expect(page.getByText(/Boarding call: \d+ minutes? left, at \d\d:\d\d/)).toHaveCount(1);
  });
});
