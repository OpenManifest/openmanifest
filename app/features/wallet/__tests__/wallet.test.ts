import { OrderState } from 'app/api/schema.d';
import { effectCents, groupByDay, heldCents, ordersOf, paidBy, statusOf } from '../wallet';

const order = (id: string, extra: Record<string, unknown> = {}) =>
  ({
    id,
    state: OrderState.Completed,
    amountCents: 4000,
    title: `Slot ${id}`,
    orderNumber: Number(id),
    createdAt: '2026-10-20T01:00:00Z',
    buyer: { __typename: 'Membership', id: 'm1' },
    seller: { __typename: 'Operator', id: 'o1', name: 'Demo' },
    receipts: [],
    ...extra,
  }) as never;

describe('paidBy and effectCents', () => {
  it('takes what the member paid off, and adds what they were given', () => {
    const paid = order('1');
    const given = order('2', { buyer: { __typename: 'Operator', id: 'o1', name: 'Demo' } });

    expect(paidBy(paid, 'm1')).toBe(true);
    expect(paidBy(given, 'm1')).toBe(false);
    expect(effectCents(paid, 'm1')).toBe(-4000);
    expect(effectCents(given, 'm1')).toBe(4000);
  });

  it('has no effect once the order was refunded or cancelled', () => {
    expect(effectCents(order('1', { state: OrderState.Refunded }), 'm1')).toBe(0);
    expect(effectCents(order('1', { state: OrderState.Cancelled }), 'm1')).toBe(0);
  });
});

describe('heldCents', () => {
  it('adds up the pending orders the member paid for, and nothing else', () => {
    const orders = [
      order('1', { state: OrderState.Pending }),
      order('2', { state: OrderState.Pending, amountCents: 2500 }),
      order('3', { state: OrderState.Completed }),
      order('4', { state: OrderState.Refunded }),
      order('5', {
        state: OrderState.Pending,
        buyer: { __typename: 'Membership', id: 'someone else' },
      }),
    ];

    expect(heldCents(orders, 'm1')).toBe(6500);
    expect(heldCents([], 'm1')).toBe(0);
  });
});

describe('groupByDay', () => {
  it('groups orders by the day at the operator, keeping the order they came in', () => {
    const days = groupByDay(
      [
        order('1', { createdAt: '2026-10-20T15:00:00Z' }),
        order('2', { createdAt: '2026-10-20T03:00:00Z' }),
        order('3', { createdAt: '2026-10-19T03:00:00Z' }),
      ],
      'Australia/Brisbane'
    );

    // 15:00 UTC is 01:00 the next day in Brisbane
    expect(days.map(({ title, orders }) => [title, orders.length])).toEqual([
      ['21 Oct 2026', 1],
      ['20 Oct 2026', 1],
      ['19 Oct 2026', 1],
    ]);
  });
});

describe('statusOf and ordersOf', () => {
  it('names a status for each state of an order', () => {
    expect(statusOf(OrderState.Pending)).toBe('info');
    expect(statusOf(OrderState.Completed)).toBe('ok');
    expect(statusOf(OrderState.Refunded)).toBe('warning');
    expect(statusOf(OrderState.Cancelled)).toBe('cancelled');
  });

  it('lists the orders of a query without the empty edges', () => {
    const data = {
      membership: {
        orders: { edges: [{ node: order('1') }, null, { node: null }, { node: order('2') }] },
      },
    } as never;

    expect(ordersOf(data).map(({ id }) => id)).toEqual(['1', '2']);
    expect(ordersOf(undefined)).toEqual([]);
  });
});
