import * as React from 'react';
import { DropzonesDocument } from 'app/api/reflection';
import { DropzonesProvider } from 'app/api/crud';
import { dropzoneExtensive } from 'app/__fixtures__/dropzone.fixture';
import * as appRedux from '../../state';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import DropzonesScreen from '../../screens/limbo/dropzone_select/DropzonesScreen';

const authenticatedState = {
  ...appRedux.initialState,
  global: {
    ...appRedux.initialState.global,
    authenticated: true,
    credentials: { accessToken: 'jest', client: 'jest', uid: 'jest@example.com', tokenType: 'Bearer', expiry: 9999999999 },
  },
};

const dropzonesMock = (nodes: Array<typeof dropzoneExtensive>) => ({
  request: { query: DropzonesDocument, operationName: 'Dropzones', variables: {} },
  result: {
    data: {
      __typename: 'Query',
      dropzones: { __typename: 'DropzoneConnection', edges: nodes.map((node) => ({ __typename: 'DropzoneEdge', node })) },
    },
  },
});

function renderScreen(nodes: Array<typeof dropzoneExtensive>) {
  return render(
    <DropzonesProvider>
      <DropzonesScreen />
    </DropzonesProvider>,
    { initialState: authenticatedState, graphql: [dropzonesMock(nodes)] }
  );
}

describe('<DropzonesScreen />', () => {
  it('lists the dropzones returned by the Dropzones query', async () => {
    const screen = renderScreen([
      { ...dropzoneExtensive, id: '1', name: 'Skydive Jest' },
      { ...dropzoneExtensive, id: '2', name: 'Alpha' },
    ]);

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeTruthy();
    });
    expect(screen.getByText('Skydive')).toBeTruthy();
  });

  it('stores the dropzone when a card is pressed', async () => {
    const screen = renderScreen([{ ...dropzoneExtensive, id: '7', name: 'Alpha' }]);

    const card = await waitFor(() => screen.getByText('Alpha'));
    fireEvent.press(card);

    expect(screen.store.getState().global.currentDropzoneId).toBe(7);
    expect(screen.store.getState().global.currentDropzone?.name).toBe('Alpha');
  });

  it('shows an empty state when there are no dropzones', async () => {
    const screen = renderScreen([]);

    await waitFor(() => {
      expect(screen.getByText('No dropzones?')).toBeTruthy();
    });
  });
});
