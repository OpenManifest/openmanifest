import { OrderState } from 'app/api/schema.d';
import type { OperatorTransactionsQuery } from 'app/api/operations';

type Edges = NonNullable<
  NonNullable<NonNullable<OperatorTransactionsQuery['operator']>['orders']>['edges']
>;
export type MoneyOrder = NonNullable<NonNullable<Edges[number]>['node']>;

/** The orders of the query, newest first as the API gives them */
export function ordersOf(data?: OperatorTransactionsQuery | null): MoneyOrder[] {
  return (data?.operator?.orders?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is MoneyOrder => !!node);
}

type Party = MoneyOrder['buyer'] | MoneyOrder['seller'];

/** The name of a party of an order: the member's, or the operator's */
export function partyName(party?: Party | null): string {
  if (!party) return '';
  if (party.__typename === 'Operator') return party.name ?? '';
  if (party.__typename === 'Membership') return party.user?.name ?? '';
  return '';
}

/** The member on the other side of the order from the operator (the one whose receipt it is) */
export function memberOf(order: MoneyOrder): { id: string; name: string } | undefined {
  const party = order.buyer?.__typename === 'Membership' ? order.buyer : order.seller;
  if (party?.__typename !== 'Membership') return undefined;
  return { id: party.id, name: party.user?.name ?? '' };
}

/**
 * What the order did to the operator's money: plus what a member paid it, minus what it paid or gave out (a top-up is
 * the operator selling credit); none once it was undone.
 */
export function operatorEffectCents(order: MoneyOrder, operatorId: string): number {
  if (order.state === OrderState.Refunded || order.state === OrderState.Cancelled) return 0;
  if (order.seller?.__typename === 'Operator' && order.seller.id === operatorId)
    return order.amountCents;
  if (order.buyer?.__typename === 'Operator' && order.buyer.id === operatorId)
    return -order.amountCents;
  return 0;
}

/** What the operator took in and paid out over the orders shown */
export function sumsOf(orders: readonly MoneyOrder[], operatorId: string) {
  return orders.reduce(
    (sum, order) => {
      const effect = operatorEffectCents(order, operatorId);
      if (effect > 0) sum.inCents += effect;
      else sum.outCents -= effect;
      return sum;
    },
    { inCents: 0, outCents: 0 }
  );
}
