import * as React from 'react';
import { Text, View } from 'react-native';
import { CreateOrderDocument } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers';
import { useUserProfile } from 'app/api/crud';
import { Button } from 'react-native-paper';
import { operatorExtensive } from 'app/__fixtures__/operator.fixture';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import CreditSheet from '../../forms/credits/Credits';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { scoped, textInputs } from 'app/test-utils/hosts';

jest.setTimeout(30000);

const MEMBER = {
  __typename: 'Membership',
  id: '77',
  walletId: 'member-wallet',
  creditsCents: 2000,
  user: { __typename: 'User', id: '77', name: 'Member Jumper' },
};

// The form refuses to submit until the operator has loaded
function OperatorReady() {
  const {
    operator: { operator },
  } = useOperatorContext();
  return operator?.id ? <Text>dropzone ready</Text> : null;
}

function renderSheet(mutationResult: jest.Mock, variables: Record<string, unknown>) {
  return render(
    <View testID="under-test">
      <OperatorReady />
      {/* @ts-expect-error Only the fields used by the sheet are provided */}
      <CreditSheet open membership={MEMBER} onClose={jest.fn()} />
    </View>,
    {
      session: authenticatedSession,
      graphql: [
        {
          request: { query: CreateOrderDocument, operationName: 'CreateOrder', variables },
          result: mutationResult,
        },
      ],
    }
  );
}

const orderResult = () =>
  jest.fn(() => ({
    data: {
      createOrder: {
        __typename: 'CreateOrderPayload',
        order: null,
        errors: null,
        fieldErrors: null,
      },
    },
  }));

describe('<CreditSheet />', () => {
  it('a deposit of 50 sells credits from the dropzone wallet to the member wallet', async () => {
    const mutationResult = orderResult();
    const screen = await renderSheet(mutationResult, {
      amountCents: 5000,
      title: 'Added funds',
      seller: MEMBER.walletId,
      buyer: operatorExtensive.walletId,
      operator: operatorExtensive.id,
    });

    // The manifest provider mounts its own closed copy of this sheet, so scope to ours
    const sheet = scoped(screen.getByTestId('under-test'));
    await waitFor(() => expect(sheet.getByText('dropzone ready')).toBeTruthy(), { timeout: 10000 });
    const [, amount] = textInputs(sheet.container);
    await fireEvent.changeText(amount, '50');
    await waitFor(() => expect(sheet.getByText('+$50')).toBeTruthy());
    await fireEvent.press(sheet.getByText('Save'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  // The sheet's "Withdraw" tab uses a native pager that cannot be driven headlessly, so exercise the hook it calls.
  it('a withdrawal of 15 buys credits back: the member wallet is the buyer', async () => {
    const mutationResult = orderResult();
    function Withdraw() {
      const { withdrawCredits } = useUserProfile();
      return (
        <Button onPress={() => withdrawCredits(MEMBER as never, { amount: 15 })}>
          Withdraw 15
        </Button>
      );
    }
    const screen = await render(
      <View testID="under-test">
        <OperatorReady />
        <Withdraw />
      </View>,
      {
        session: authenticatedSession,
        graphql: [
          {
            request: {
              query: CreateOrderDocument,
              operationName: 'CreateOrder',
              variables: {
                amountCents: 1500,
                title: 'Withdrew funds',
                buyer: MEMBER.walletId,
                seller: operatorExtensive.walletId,
                operator: operatorExtensive.id,
              },
            },
            result: mutationResult,
          },
        ],
      }
    );

    await waitFor(() => expect(screen.getByText('dropzone ready')).toBeTruthy(), {
      timeout: 10000,
    });
    await fireEvent.press(screen.getByText('Withdraw 15'));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('does not submit an amount of zero', async () => {
    const screen = await renderSheet(orderResult(), {});

    const sheet = scoped(screen.getByTestId('under-test'));
    await fireEvent.press(sheet.getByText('Save'));

    await waitFor(() => expect(sheet.getByText('Amount must be greater than 0')).toBeTruthy());
  });
});
