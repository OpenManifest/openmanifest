import { OrderState } from 'app/api/schema.d';
import type { WalletQuery } from 'app/api/operations';
import type { StatusKey } from 'app/ui';
import { formatDate } from 'app/i18n/format';

type Edges = NonNullable<NonNullable<NonNullable<WalletQuery['membership']>['orders']>['edges']>;
export type WalletOrder = NonNullable<NonNullable<Edges[number]>['node']>;

/** The orders of the query, newest first as the API gives them */
export function ordersOf(data?: WalletQuery | null): WalletOrder[] {
  return (data?.membership?.orders?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is WalletOrder => !!node);
}

/** Whether the member paid for the order (a jump they booked), as opposed to being paid or topped up */
export function paidBy(order: Pick<WalletOrder, 'buyer'>, membershipId: string): boolean {
  return order.buyer?.__typename === 'Membership' && order.buyer.id === membershipId;
}

/**
 * Money held for booked jumps: the orders the member paid for that are still pending (the jump has not been flown).
 * It is already off their balance, and comes back when they come off the load.
 */
export function heldCents(orders: readonly WalletOrder[], membershipId: string): number {
  return orders
    .filter((order) => order.state === OrderState.Pending && paidBy(order, membershipId))
    .reduce((sum, order) => sum + order.amountCents, 0);
}

/** What the order did to the balance: minus what the member paid, plus what they were given; none once it was undone */
export function effectCents(order: WalletOrder, membershipId: string): number {
  if (order.state === OrderState.Refunded || order.state === OrderState.Cancelled) return 0;
  return paidBy(order, membershipId) ? -order.amountCents : order.amountCents;
}

/** The status pill of an order: held until the jump is flown, done, or undone */
export function statusOf(state: OrderState): StatusKey {
  switch (state) {
    case OrderState.Pending:
      return 'info';
    case OrderState.Completed:
      return 'ok';
    case OrderState.Refunded:
      return 'warning';
    default:
      return 'cancelled';
  }
}

export type OrderDay = { day: string; title: string; orders: WalletOrder[] };

/** The orders in groups by the day they were made at the operator, in the order they came */
export function groupByDay(orders: readonly WalletOrder[], timeZone?: string | null): OrderDay[] {
  const days: OrderDay[] = [];
  orders.forEach((order) => {
    const title = formatDate(order.createdAt, timeZone);
    const last = days[days.length - 1];
    if (last && last.title === title) last.orders.push(order);
    else days.push({ day: `${title}-${order.id}`, title, orders: [order] });
  });
  return days;
}
