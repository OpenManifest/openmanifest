import * as React from 'react';
import { OperatorsDocument, JoinOperatorDocument } from 'app/api/reflection';
import { OperatorsProvider } from 'app/api/crud';
import { operatorExtensive } from 'app/__fixtures__/operator.fixture';
import { useSession } from '../../state';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import OperatorsScreen from '../../screens/limbo/operator_select/OperatorsScreen';
import { credentials } from 'app/__fixtures__/session.fixture';

type OperatorNode = Omit<typeof operatorExtensive, 'currentUser'> & {
  currentUser: typeof operatorExtensive.currentUser | null;
};

const operatorsMock = (nodes: OperatorNode[]) => ({
  request: { query: OperatorsDocument, operationName: 'Operators', variables: {} },
  result: {
    data: {
      __typename: 'Query',
      operators: {
        __typename: 'OperatorConnection',
        edges: nodes.map((node) => ({ __typename: 'OperatorEdge', node })),
      },
    },
  },
});

function renderScreen(nodes: OperatorNode[], extraMocks: unknown[] = []) {
  return render(
    <OperatorsProvider>
      <OperatorsScreen />
    </OperatorsProvider>,
    {
      session: { credentials },
      graphql: [operatorsMock(nodes), ...(extraMocks as never[])],
    }
  );
}

describe('<OperatorsScreen />', () => {
  it('lists the dropzones returned by the Dropzones query', async () => {
    const screen = renderScreen([
      { ...operatorExtensive, id: '1', name: 'Skydive Jest' },
      { ...operatorExtensive, id: '2', name: 'Alpha' },
    ]);

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeTruthy();
    });
    expect(screen.getByText('Skydive')).toBeTruthy();
  });

  it('stores the dropzone when a card is pressed', async () => {
    const screen = renderScreen([{ ...operatorExtensive, id: '7', name: 'Alpha' }]);

    const card = await waitFor(() => screen.getByText('Alpha'));
    fireEvent.press(card);

    expect(useSession.getState().currentOperatorId).toBe('7');
  });

  describe('a dropzone the user has not joined', () => {
    const joinMock = (result: Record<string, unknown> | jest.Mock) => ({
      request: {
        query: JoinOperatorDocument,
        operationName: 'JoinOperator',
        variables: { operator: '8' },
      },
      result:
        typeof result === 'function'
          ? result
          : { data: { __typename: 'Mutation', joinOperator: result } },
    });

    it('joins it before it becomes the current dropzone', async () => {
      const joined = jest.fn(() => ({
        data: {
          __typename: 'Mutation',
          joinOperator: {
            __typename: 'JoinOperatorPayload',
            membership: { __typename: 'Membership', id: '99' },
            errors: null,
            fieldErrors: null,
          },
        },
      }));
      const screen = renderScreen(
        [{ ...operatorExtensive, id: '8', name: 'Newcomer', currentUser: null }],
        [joinMock(joined)]
      );

      fireEvent.press(await waitFor(() => screen.getByText('Newcomer')));

      await waitFor(() => expect(useSession.getState().currentOperatorId).toBe('8'));
      expect(joined).toHaveBeenCalledTimes(1);
    });

    it('is not selected when joining is refused', async () => {
      const screen = renderScreen(
        [{ ...operatorExtensive, id: '8', name: 'Newcomer', currentUser: null }],
        [
          joinMock({
            __typename: 'JoinOperatorPayload',
            membership: null,
            errors: ['This dropzone cannot be joined'],
            fieldErrors: null,
          }),
        ]
      );

      fireEvent.press(await waitFor(() => screen.getByText('Newcomer')));

      await waitFor(() => expect(screen.getByText('Newcomer')).toBeTruthy());
      // Give the mutation time to answer before checking that nothing was selected
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(useSession.getState().currentOperatorId).toBeNull();
    });
  });

  it('shows an empty state when there are no dropzones', async () => {
    const screen = renderScreen([]);

    await waitFor(() => {
      expect(screen.getByText('No dropzones?')).toBeTruthy();
    });
  });
});
