import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { slotOf } from 'app/__fixtures__/board.fixture';
import MOCK_QUERY_LOADS from 'app/__tests__/manifest/__mocks__/QueryLoads.mock';
import { Permission } from 'app/api/schema.d';
import { render, waitFor } from '../../../__mocks__/render';
import MoveToSheet from '../MoveToSheet';

jest.setTimeout(30000);

async function renderSheet(loadId: string) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  return render(
    <MoveToSheet slot={slotOf('s1', 'Ann Ready')} loadId={loadId} open onClose={jest.fn()} />,
    {
      session: authenticatedSession,
      permissions: [Permission.UpdateSlot],
      graphql: [MOCK_QUERY_LOADS()],
    }
  );
}

describe('<MoveToSheet />', () => {
  afterEach(() => jest.restoreAllMocks());

  it('names the person and lists the other loads of the day with their free places', async () => {
    const sheet = await renderSheet('1');

    await waitFor(() => expect(sheet.getByTestId('move-to-2-')).toBeTruthy(), { timeout: 10000 });
    expect(sheet.getByText('Move Ann Ready')).toBeTruthy();
    expect(sheet.getByText('Load #2')).toBeTruthy();
    expect(sheet.queryByText('Load #1')).toBeNull();
  });
});
