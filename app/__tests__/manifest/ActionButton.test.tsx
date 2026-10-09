import * as React from 'react';
import { DateTime, Settings } from 'luxon';
import { FAB } from 'react-native-paper';
import { LoadState, Permission } from 'app/api/schema.d';
import { FinalizeLoadDocument, LoadUpdatedDocument, UpdateLoadDocument } from 'app/api/reflection';
import { NotificationContext } from 'app/providers/notifications/context';
import { LoadContextProvider, useLoadContext } from 'app/providers';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_LOAD from './__mocks__/QueryLoad.mock';
import ActionButton from '../../screens/authenticated/dropzone/load/ActionButton';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const NOW = new Date('2026-10-08T10:00:00Z').valueOf();

function LoadActions() {
  const {
    load: { load },
  } = useLoadContext();
  return load ? <ActionButton load={load} /> : null;
}

describe('<ActionButton />', () => {
  const originalNow = Settings.now;
  beforeEach(() => {
    Settings.now = () => NOW;
  });
  afterEach(() => {
    Settings.now = originalNow;
  });

  it('"10 minute call" sets the load to BOARDING_CALL with a dispatch time 10 minutes ahead', async () => {
    const loadMock = MOCK_QUERY_LOAD(
      {},
      { load: { createdAt: new Date(NOW).toISOString() as never } }
    );
    const updateResult = jest.fn(() => ({
      data: {
        updateLoad: {
          __typename: 'UpdateLoadPayload',
          errors: null,
          fieldErrors: null,
          load: null,
        },
      },
    }));

    const screen = render(
      <LoadContextProvider id="1">
        <LoadActions />
      </LoadContextProvider>,
      {
        session: authenticatedSession,
        permissions: [Permission.UpdateLoad],
        graphql: [
          loadMock,
          {
            request: { query: LoadUpdatedDocument, variables: { id: '1' } },
            result: { data: { loadUpdated: { __typename: 'LoadUpdatedPayload', load: null } } },
          },
          {
            request: {
              query: UpdateLoadDocument,
              operationName: 'UpdateLoad',
              variables: {
                id: '1',
                attributes: {
                  dispatchAt: DateTime.fromMillis(NOW).plus({ minutes: 10 }).toISO(),
                  state: LoadState.BoardingCall,
                },
              },
            },
            result: updateResult,
          },
        ],
      }
    );

    // Open the speed dial once the load has loaded
    await waitFor(() => expect(screen.UNSAFE_getAllByType(FAB.Group).length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    const fabs = screen.UNSAFE_getAllByType(FAB);
    fireEvent.press(fabs[fabs.length - 1]);

    const call = await waitFor(() => screen.getByText('10 minute call'), { timeout: 10000 });
    fireEvent.press(call);

    await waitFor(() => expect(updateResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  describe('finalizing a load', () => {
    const renderBoardingCall = (finalizeResult: unknown) => {
      const notifications = { success: jest.fn(), error: jest.fn(), info: jest.fn() };
      const screen = render(
        <NotificationContext.Provider value={notifications}>
          <LoadContextProvider id="1">
            <LoadActions />
          </LoadContextProvider>
        </NotificationContext.Provider>,
        {
          session: authenticatedSession,
          permissions: [Permission.UpdateLoad],
          graphql: [
            MOCK_QUERY_LOAD({}, { load: { state: LoadState.BoardingCall } }),
            {
              request: { query: LoadUpdatedDocument, variables: { id: '1' } },
              result: { data: { loadUpdated: { __typename: 'LoadUpdatedPayload', load: null } } },
            },
            {
              request: {
                query: FinalizeLoadDocument,
                variables: { id: 1, state: LoadState.Landed },
              },
              ...(finalizeResult as object),
            },
          ],
        }
      );
      return { screen, notifications };
    };

    const pressMarkAsLanded = async (screen: ReturnType<typeof render>) => {
      await waitFor(() => expect(screen.UNSAFE_getAllByType(FAB.Group).length).toBeGreaterThan(0), {
        timeout: 10000,
      });
      const fabs = screen.UNSAFE_getAllByType(FAB);
      fireEvent.press(fabs[fabs.length - 1]);
      fireEvent.press(await waitFor(() => screen.getByText('Mark as Landed'), { timeout: 10000 }));
    };

    it('shows the error the server gives for landing', async () => {
      const { screen, notifications } = renderBoardingCall({
        result: {
          data: {
            finalizeLoad: {
              __typename: 'FinalizeLoadPayload',
              errors: ["Load #1 can't land, it is landed"],
              fieldErrors: null,
              load: null,
            },
          },
        },
      });

      await pressMarkAsLanded(screen);

      await waitFor(
        () => expect(notifications.error).toHaveBeenCalledWith("Load #1 can't land, it is landed"),
        { timeout: 10000 }
      );
    });

    it('shows an error when the request fails', async () => {
      const { screen, notifications } = renderBoardingCall({ error: new Error('Network down') });

      await pressMarkAsLanded(screen);

      await waitFor(() => expect(notifications.error).toHaveBeenCalledWith('Network down'), {
        timeout: 10000,
      });
    });
  });

  describe('the day of the load, at the dropzone (a Brisbane dropzone, a device in UTC)', () => {
    // 23:00 UTC on 8 October is 09:00 on 9 October in Brisbane
    const renderLoadCreatedAt = (createdAt: string) => {
      Settings.now = () => new Date('2026-10-08T23:00:00Z').valueOf();
      const originalZone = Settings.defaultZone;
      Settings.defaultZone = 'UTC';
      const screen = render(
        <LoadContextProvider id="1">
          <LoadActions />
        </LoadContextProvider>,
        {
          session: authenticatedSession,
          permissions: [Permission.UpdateLoad],
          graphql: [
            MOCK_QUERY_LOAD({}, { load: { createdAt: createdAt as never, state: LoadState.Open } }),
            {
              request: { query: LoadUpdatedDocument, variables: { id: '1' } },
              result: { data: { loadUpdated: { __typename: 'LoadUpdatedPayload', load: null } } },
            },
          ],
        }
      );
      return { screen, restore: () => (Settings.defaultZone = originalZone) };
    };

    const openActions = async (screen: ReturnType<typeof render>) => {
      await waitFor(() => expect(screen.UNSAFE_getAllByType(FAB.Group).length).toBeGreaterThan(0), {
        timeout: 10000,
      });
      const fabs = screen.UNSAFE_getAllByType(FAB);
      fireEvent.press(fabs[fabs.length - 1]);
    };

    it('offers a call for a load created on the dropzone day, though the device is still a day behind', async () => {
      // 02:00 on 9 October in Brisbane, 16:00 on 8 October in UTC
      const { screen, restore } = renderLoadCreatedAt('2026-10-08T16:00:00Z');

      await openActions(screen);
      expect(
        await waitFor(() => screen.getByText('10 minute call'), { timeout: 10000 })
      ).toBeTruthy();
      restore();
    });

    it('offers no call for a load of the dropzone day before, though the device date matches', async () => {
      // 19:00 on 8 October in Brisbane, 09:00 on 8 October in UTC: the same day on the device, yesterday at the dropzone
      const { screen, restore } = renderLoadCreatedAt('2026-10-08T09:00:00Z');

      await openActions(screen);
      // The load itself has loaded (an open load can be cancelled), but the day is over: no call
      await waitFor(() => screen.getByText('Cancel load'), { timeout: 10000 });
      expect(screen.queryByText('10 minute call')).toBeNull();
      restore();
    });
  });
});
