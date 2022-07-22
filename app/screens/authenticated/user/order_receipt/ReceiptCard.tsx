import * as React from 'react';
import { List } from 'react-native-paper';
import { Wallet } from 'app/api/schema.d';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
import {
  DropzoneEssentialsFragment,
  DropzoneUserEssentialsFragment,
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
  const { currentUser } = useDropzoneContext();

  const isUser = React.useCallback(
    (entity: Wallet | DropzoneEssentialsFragment | DropzoneUserEssentialsFragment) => {
      return (
        '__typename' in entity &&
        entity.__typename === 'DropzoneUser' &&
        entity.id === currentUser?.id
      );
    },
    [currentUser]
  );

  return (
    <>
      <List.Subheader>{`Receipt #${index + 1}`}</List.Subheader>
      {receipt?.transactions
        ?.filter((transaction) => isUser(transaction.receiver as DropzoneUserEssentialsFragment))
        .map((transaction) => (
          <TransactionCard {...{ transaction }} />
        ))}
    </>
  );
}
