import * as React from 'react';
import { DateTime, Settings } from 'luxon';
import { FAB } from 'react-native-paper';
import { LoadState, Permission } from 'app/api/schema.d';
import { LoadUpdatedDocument, UpdateLoadDocument } from 'app/api/reflection';
import { LoadContextProvider, useLoadContext } from 'app/providers';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_LOAD from './__mocks__/QueryLoad.mock';
import ActionButton from '../../screens/authenticated/dropzone/load/ActionButton';

jest.setTimeout(30000);

const NOW = new Date('2026-10-08T10:00:00Z').valueOf();

const authenticatedState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    authenticated: true,
    credentials: {
      accessToken: 'jest',
      client: 'jest',
      uid: 'jest@example.com',
      tokenType: 'Bearer',
      expiry: 9999999999,
    },
    currentDropzoneId: 1,
  },
};

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
    const loadMock = MOCK_QUERY_LOAD();
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
        initialState: authenticatedState,
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
});
