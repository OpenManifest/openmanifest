import * as React from 'react';
import '@testing-library/jest-native';
import { Permission } from 'app/api/schema.d';
import { LoadUpdatedDocument } from 'app/api/reflection';
import * as appRedux from '../../state';
import { render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_LOAD from './__mocks__/QueryLoad.mock';
import LoadScreen from '../../screens/authenticated/dropzone/load/LoadScreen';

jest.mock('@react-navigation/core', () => ({
  ...jest.requireActual('@react-navigation/core'),
  useNavigation: () => jest.fn(),
  useRoute: () => ({ params: { loadId: '1' } }),
  useIsFocused: () => false,
}));

const loadUpdatedMock = {
  request: { query: LoadUpdatedDocument, variables: { id: '1' } },
  result: { data: { loadUpdated: { __typename: 'LoadUpdatedPayload', load: null } } },
};

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

describe('<LoadScreen />', () => {
  it('renders a row for every slot plus one "Available" row for each free slot', async () => {
    const mock = MOCK_QUERY_LOAD();
    const { slots, maxSlots } = (
      mock.result as { data: { load: { slots: unknown[]; maxSlots: number } } }
    ).data.load;

    const screen = render(<LoadScreen />, {
      graphql: [mock, loadUpdatedMock],
      permissions: [Permission.ReadLoad],
      initialState: authenticatedState,
    });

    await waitFor(
      () => {
        expect(screen.queryAllByTestId('slot-row').length).toBe(maxSlots);
      },
      { timeout: 10000 }
    );
    expect(screen.queryAllByText('- Available -').length).toBe(maxSlots - slots.length);
    expect(slots.length).toBe(3);
    ['Amy Hops', 'Ali Falls', 'John Stumble'].forEach((name) =>
      expect(screen.getByText(name)).toBeTruthy()
    );
  });

  it('shows the load status, slot count and weight', async () => {
    const mock = MOCK_QUERY_LOAD();
    const screen = render(<LoadScreen />, {
      graphql: [mock, loadUpdatedMock],
      permissions: [Permission.ReadLoad],
      initialState: authenticatedState,
    });

    await waitFor(() => expect(screen.getByText('Open')).toBeTruthy(), { timeout: 10000 });
    expect(screen.getByText('3/10')).toBeTruthy();
    expect(screen.getByText('100kg')).toBeTruthy();
  });
});
