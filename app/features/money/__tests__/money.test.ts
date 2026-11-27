import { OrderState } from 'app/api/schema.d';
import { memberOf, operatorEffectCents, ordersOf, partyName, sumsOf } from '../money';

const member = (id: string, name: string) =>
  ({ __typename: 'Membership', id, user: { id: `u${id}`, name } }) as const;
const operator = { __typename: 'Operator', id: 'o1', name: 'Demo' } as const;

const order = (id: string, extra: Record<string, unknown> = {}) =>
  ({
    id,
    state: OrderState.Completed,
    amountCents: 4000,
    createdAt: '2026-10-20T01:00:00Z',
    buyer: member('m1', 'Jo Jumper'),
    seller: operator,
    ...extra,
  }) as never;

it('takes the orders out of the query', () => {
  expect(
    ordersOf({ operator: { orders: { edges: [{ node: order('1') }, null] } } } as never)
  ).toHaveLength(1);
  expect(ordersOf(undefined)).toEqual([]);
});

it('names the parties', () => {
  expect(partyName(member('m1', 'Jo Jumper') as never)).toBe('Jo Jumper');
  expect(partyName(operator as never)).toBe('Demo');
  expect(partyName(null)).toBe('');
});

it('finds the member of an order, buyer or seller', () => {
  expect(memberOf(order('1'))).toEqual({ id: 'm1', name: 'Jo Jumper' });
  expect(memberOf(order('2', { buyer: operator, seller: member('m2', 'Sam') }))).toEqual({
    id: 'm2',
    name: 'Sam',
  });
});

it('counts what the operator took in and paid out, and nothing for an undone order', () => {
  const sold = order('1');
  const paid = order('2', { buyer: operator, seller: member('m2', 'Sam'), amountCents: 1500 });
  const refunded = order('3', { state: OrderState.Refunded });

  expect(operatorEffectCents(sold, 'o1')).toBe(4000);
  expect(operatorEffectCents(paid, 'o1')).toBe(-1500);
  expect(operatorEffectCents(refunded, 'o1')).toBe(0);
  expect(sumsOf([sold, paid, refunded], 'o1')).toEqual({ inCents: 4000, outCents: 1500 });
});
