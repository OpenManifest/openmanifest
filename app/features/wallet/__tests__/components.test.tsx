import * as React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { OrderState } from 'app/api/schema.d';
import { renderThemed } from 'app/ui/components/testing';
import BalanceCard from '../BalanceCard';
import OrderHistory from '../OrderHistory';

const order = (id: string, extra: Record<string, unknown> = {}) =>
  ({
    id,
    state: OrderState.Completed,
    amountCents: 4000,
    title: `Slot on Load ${id}`,
    orderNumber: Number(id),
    createdAt: '2026-10-20T01:00:00Z',
    buyer: { __typename: 'Membership', id: 'm1' },
    seller: { __typename: 'Operator', id: 'o1', name: 'Demo' },
    receipts: [],
    ...extra,
  }) as never;

describe('<BalanceCard />', () => {
  it('shows the balance, what is held and where to top up', async () => {
    const { getByTestId, getByText } = await renderThemed(
      <BalanceCard creditsCents={36000} heldCents={4000} />
    );

    expect(getByTestId('wallet-balance-amount').props.children).toBe('$360.00');
    expect(getByTestId('wallet-balance-held')).toBeTruthy();
    expect(getByText('Top up at the manifest desk')).toBeTruthy();
    expect(getByText(/comes back if you come off the load/)).toBeTruthy();
  });

  it('says nothing is held when it is not', async () => {
    const { getByText } = await renderThemed(<BalanceCard creditsCents={0} heldCents={0} />);

    expect(getByText(/Nothing is held/)).toBeTruthy();
  });
});

describe('<OrderHistory />', () => {
  it('lists what the member paid with its state, and opens a receipt', async () => {
    const onOpen = jest.fn();
    const { getByTestId, getByText } = await renderThemed(
      <OrderHistory
        orders={[
          order('1', { state: OrderState.Pending }),
          order('2', { state: OrderState.Refunded }),
        ]}
        membershipId="m1"
        timeZone="Australia/Brisbane"
        onOpen={onOpen}
      />
    );

    expect(getByText('20 Oct 2026')).toBeTruthy();
    expect(getByTestId('wallet-history-1-amount').props.children).toBe('-$40.00');
    // A refunded order did nothing to the balance: its amount is not signed
    expect(getByTestId('wallet-history-2-amount').props.children).toBe('$40.00');
    await fireEvent.press(getByTestId('wallet-history-1'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('says there is nothing yet', async () => {
    const { getByTestId } = await renderThemed(<OrderHistory orders={[]} membershipId="m1" />);

    expect(getByTestId('wallet-history-empty')).toBeTruthy();
  });

  it('offers older orders when there are some', async () => {
    const onMore = jest.fn();
    const { getByTestId } = await renderThemed(
      <OrderHistory orders={[order('1')]} membershipId="m1" hasMore onMore={onMore} />
    );

    await fireEvent.press(getByTestId('wallet-history-more'));
    expect(onMore).toHaveBeenCalled();
  });
});
