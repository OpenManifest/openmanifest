import * as React from 'react';
import { Subheader } from 'app/ui';
import { Wallet } from 'app/api/schema.d';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  OperatorEssentialsFragment,
  MembershipEssentialsFragment,
  OrderEssentialsFragment,
  ReceiptEssentialsFragment,
} from 'app/api/operations';
import TransactionCard from './TransactionCard';

interface IReceiptCardProps {
  receipt: ReceiptEssentialsFragment;
  index: number;
  order: OrderEssentialsFragment;
}

export default function ReceiptCard(props: IReceiptCardProps) {
  const { receipt, index } = props;
  const {
    operator: { currentUser },
  } = useOperatorContext();

  const isUser = React.useCallback(
    (entity: Wallet | OperatorEssentialsFragment | MembershipEssentialsFragment) => {
      return (
        '__typename' in entity &&
        entity.__typename === 'Membership' &&
        entity.id === currentUser?.id
      );
    },
    [currentUser]
  );

  return (
    <>
      <Subheader>{`Receipt #${index + 1}`}</Subheader>
      {receipt?.transactions
        ?.filter((transaction) => isUser(transaction.receiver as MembershipEssentialsFragment))
        .map((transaction) => (
          <TransactionCard key={transaction.id} {...{ transaction }} />
        ))}
    </>
  );
}
