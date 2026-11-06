import * as React from 'react';
import { View } from 'react-native';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { operatorExtensive } from 'app/__fixtures__/operator.fixture';
import MOCK_QUERY_LOADS from 'app/__tests__/manifest/__mocks__/QueryLoads.mock';
import createMockedQuery from 'app/__tests__/manifest/__mocks__/createMockedQuery.mock';
import { LoadsDocument } from 'app/api/reflection';
import type { LoadsQuery, LoadsQueryVariables } from 'app/api/operations';
import { todayInZone } from 'app/utils/operatorTime';
import { fireEvent, render, waitFor, within } from '../../../../../__mocks__/render';
import DateBar, { formatDay, shiftDay } from '../DateBar';

jest.setTimeout(30000);

describe('shiftDay and formatDay', () => {
  it('moves a day across month and year ends', () => {
    expect(shiftDay('2026-10-31', 1)).toBe('2026-11-01');
    expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31');
    expect(shiftDay('2026-10-14', 0)).toBe('2026-10-14');
  });

  it('says the day the way people do', () => {
    expect(formatDay('2026-10-14')).toBe('Wednesday 14 October');
  });
});

describe('<DateBar />', () => {
  const today = todayInZone(operatorExtensive.timeZone);
  const tomorrow = shiftDay(today, 1);
  const emptyDay = createMockedQuery<LoadsQueryVariables, LoadsQuery>(
    LoadsDocument,
    { operator: '1', date: tomorrow },
    { loads: { __typename: 'LoadConnection', edges: [] } }
  );

  async function renderBar() {
    const screen = await render(
      <View testID="under-test">
        <DateBar />
      </View>,
      { session: authenticatedSession, graphql: [MOCK_QUERY_LOADS(), emptyDay()] }
    );
    return within(screen.getByTestId('under-test'));
  }

  it("starts on today in the operator's time zone", async () => {
    const bar = await renderBar();

    await waitFor(() => expect(bar.getByTestId('manifest-date')).toBeTruthy());
    expect(String(bar.getByTestId('manifest-date').props.children)).toContain('Today');
    expect(bar.queryByTestId('manifest-date-today')).toBeNull();
  });

  it('goes to the next day, and back to today', async () => {
    const bar = await renderBar();
    await waitFor(() => expect(bar.getByTestId('manifest-date-next')).toBeTruthy());

    fireEvent.press(bar.getByTestId('manifest-date-next'));

    await waitFor(() => expect(bar.getByTestId('manifest-date-today')).toBeTruthy());
    expect(String(bar.getByTestId('manifest-date').props.children)).toBe(formatDay(tomorrow));

    fireEvent.press(bar.getByTestId('manifest-date-today'));

    await waitFor(() => expect(bar.queryByTestId('manifest-date-today')).toBeNull());
    expect(String(bar.getByTestId('manifest-date').props.children)).toContain('Today');
  });
});
