import * as React from 'react';
import { DropzonesDocument, JoinDropzoneDocument } from 'app/api/reflection';
import { DropzonesProvider } from 'app/api/crud';
import { dropzoneExtensive } from 'app/__fixtures__/dropzone.fixture';
import { useSession } from '../../state';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import DropzonesScreen from '../../screens/limbo/dropzone_select/DropzonesScreen';
import { credentials } from 'app/__fixtures__/session.fixture';

type DropzoneNode = Omit<typeof dropzoneExtensive, 'currentUser'> & {
  currentUser: typeof dropzoneExtensive.currentUser | null;
};

const dropzonesMock = (nodes: DropzoneNode[]) => ({
  request: { query: DropzonesDocument, operationName: 'Dropzones', variables: {} },
  result: {
    data: {
      __typename: 'Query',
      dropzones: {
        __typename: 'DropzoneConnection',
        edges: nodes.map((node) => ({ __typename: 'DropzoneEdge', node })),
      },
    },
  },
});

function renderScreen(nodes: DropzoneNode[], extraMocks: unknown[] = []) {
  return render(
    <DropzonesProvider>
      <DropzonesScreen />
    </DropzonesProvider>,
    {
      session: { credentials },
      graphql: [dropzonesMock(nodes), ...(extraMocks as never[])],
    }
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

    expect(useSession.getState().currentDropzoneId).toBe('7');
  });

  describe('a dropzone the user has not joined', () => {
    const joinMock = (result: Record<string, unknown> | jest.Mock) => ({
      request: {
        query: JoinDropzoneDocument,
        operationName: 'JoinDropzone',
        variables: { dropzone: '8' },
      },
      result:
        typeof result === 'function'
          ? result
          : { data: { __typename: 'Mutation', joinDropzone: result } },
    });

    it('joins it before it becomes the current dropzone', async () => {
      const joined = jest.fn(() => ({
        data: {
          __typename: 'Mutation',
          joinDropzone: {
            __typename: 'JoinDropzonePayload',
            dropzoneUser: { __typename: 'DropzoneUser', id: '99' },
            errors: null,
            fieldErrors: null,
          },
        },
      }));
      const screen = renderScreen(
        [{ ...dropzoneExtensive, id: '8', name: 'Newcomer', currentUser: null }],
        [joinMock(joined)]
      );

      fireEvent.press(await waitFor(() => screen.getByText('Newcomer')));

      await waitFor(() => expect(useSession.getState().currentDropzoneId).toBe('8'));
      expect(joined).toHaveBeenCalledTimes(1);
    });

    it('is not selected when joining is refused', async () => {
      const screen = renderScreen(
        [{ ...dropzoneExtensive, id: '8', name: 'Newcomer', currentUser: null }],
        [
          joinMock({
            __typename: 'JoinDropzonePayload',
            dropzoneUser: null,
            errors: ['This dropzone cannot be joined'],
            fieldErrors: null,
          }),
        ]
      );

      fireEvent.press(await waitFor(() => screen.getByText('Newcomer')));

      await waitFor(() => expect(screen.getByText('Newcomer')).toBeTruthy());
      // Give the mutation time to answer before checking that nothing was selected
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(useSession.getState().currentDropzoneId).toBeNull();
    });
  });

  it('shows an empty state when there are no dropzones', async () => {
    const screen = renderScreen([]);

    await waitFor(() => {
      expect(screen.getByText('No dropzones?')).toBeTruthy();
    });
  });
});
