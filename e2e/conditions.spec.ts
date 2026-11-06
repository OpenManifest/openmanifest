import type { Page } from '@playwright/test';
import { ownerCall } from './support/api';
import { expectAccessible } from './support/a11y';
import { expectLayout } from './support/layout';
import { pressUntil } from './support/press';
import { expect, gotoRoute, test } from './support/test';

const BOARD = '/manifest';

type Conditions = {
  operatorId: string;
  id: string;
  jumpRun: number | null;
  temperatureC: number;
  winds: { altitudeM: number; speedMps: number; direction: number; temperatureC: number | null }[];
};

/** The seed operator's conditions of the day, as the API has them */
async function currentConditions(): Promise<Conditions> {
  const { json } = await ownerCall(
    '{ operators { edges { node { id currentConditions { id jumpRun temperatureC winds { altitudeM speedMps direction temperatureC } } } } } }'
  );
  const node = json.data.operators.edges[0].node;
  return { operatorId: node.id, ...node.currentConditions };
}

/** Puts the conditions back as they were before the spec */
async function restore(conditions: Conditions) {
  const winds = conditions.winds.map((wind) => ({
    altitude_m: wind.altitudeM,
    speed_mps: wind.speedMps,
    direction: wind.direction,
    temperature_c: wind.temperatureC,
  }));
  const { json } = await ownerCall(
    `mutation($winds: String, $jumpRun: Int, $temperatureC: Float) { createWeatherCondition(input: { id: ${Number(conditions.id)}, attributes: { operatorId: ${Number(conditions.operatorId)}, winds: $winds, jumpRun: $jumpRun, temperatureC: $temperatureC } }) { errors } }`,
    {
      winds: JSON.stringify(winds),
      jumpRun: conditions.jumpRun,
      temperatureC: conditions.temperatureC,
    }
  );
  expect(json?.data?.createWeatherCondition?.errors ?? null).toBeNull();
}

async function openPanel(page: Page) {
  const strip = page.getByTestId('board-conditions');
  await expect(strip).toBeVisible();
  await pressUntil(page, strip.getByRole('button', { name: 'Update' }), () =>
    expect(page.getByTestId('conditions-panel')).toBeVisible({ timeout: 3000 })
  );
  // The overlay is a dialog named by its title; its box is the test id's
  return page.getByRole('dialog', { name: 'Conditions of the day' });
}

test.describe('the conditions of the day @conditions @board', () => {
  test('are changed in a panel from the strip of the board', async ({ page }) => {
    const before = await currentConditions();
    try {
      await gotoRoute(page, BOARD);
      // The board with its strip lays out; the panel then covers it (and its button for a new load)
      await expect(page.getByTestId('board-conditions')).toBeVisible();
      await expectLayout(page, `${BOARD} conditions`);
      const panel = await openPanel(page);

      // The temperature, a heading in degrees (no dial) and a row for each height, in the operator's units
      await expect(panel.getByRole('spinbutton', { name: 'Ground temperature' })).toBeVisible();
      const heading = panel.getByRole('spinbutton', { name: 'Jump run heading' });
      await expect(heading).toBeVisible();
      await expect(panel.getByRole('group', { name: 'Wind 1' })).toBeVisible();
      await expect(panel.getByTestId('conditions-panel-wind-0')).toContainText('ft');
      await expect(panel.getByTestId('conditions-panel-wind-0')).toContainText('kn');
      await expectAccessible(page, `${BOARD} conditions`);

      const rows = panel.locator('[data-testid^="conditions-panel-wind-"][role="group"]');
      const count = await rows.count();
      await panel.getByRole('button', { name: 'Add a height' }).click();
      await expect(rows).toHaveCount(count + 1);
      await panel.getByRole('button', { name: `Remove wind ${count + 1}` }).click();
      await expect(rows).toHaveCount(count);

      // A heading is kept from 0 to 359 degrees
      await heading.fill('360');
      await heading.blur();
      await expect(heading).toHaveValue('359');

      await heading.fill('275');
      await panel.getByRole('spinbutton', { name: 'Speed 1', exact: true }).fill('25');
      await panel.getByRole('button', { name: 'Save conditions' }).click();
      await expect(page.getByTestId('conditions-panel')).toBeHidden();
      await expect(page.getByTestId('board-conditions')).toContainText('Heading 275°');
      await expect(page.getByTestId('board-conditions')).toContainText('Wind 25 kn');

      // The API has what was saved
      const after = await currentConditions();
      expect(after.jumpRun).toBe(275);
      expect(after.winds.length).toBe(before.winds.length);
    } finally {
      await restore(before);
    }
  });

  for (const path of ['/weather', '/weather/winds', '/weather/jumprun']) {
    test(`the old ${path} opens the board with the panel`, async ({ page }) => {
      await gotoRoute(page, path);
      const panel = page.getByRole('dialog', { name: 'Conditions of the day' });
      await expect(page.getByTestId('conditions-panel')).toBeVisible();
      await expect(page.getByTestId('board')).toBeAttached();
      expect(new URL(page.url()).pathname).toBe(BOARD);
      await panel.getByRole('button', { name: 'Close' }).first().click();
      await expect(page.getByTestId('conditions-panel')).toBeHidden();
    });
  }
});

test.describe('the conditions for a member @conditions', () => {
  test.use({ role: 'student' });

  test('are shown without a way to change them', async ({ page }) => {
    await gotoRoute(page, '/weather');
    const strip = page.getByTestId('board-conditions');
    await expect(strip).toBeVisible();
    await expect(strip.getByRole('button', { name: 'Update' })).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'Conditions of the day' })).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe(BOARD);
  });
});
