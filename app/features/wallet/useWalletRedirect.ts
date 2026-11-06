import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers';

/**
 * A member's own transactions and receipts are the Wallet's: those who do not run the money (no `readUserTransactions`)
 * are sent there from the old paths of the profile. Returns whether it is doing so, for the screen to show nothing
 * meanwhile. Staff, and anybody else's transactions, stay on the old screens (Money).
 */
export default function useWalletRedirect(membershipId?: string | null, orderId?: string) {
  const navigation = useNavigation();
  const canReadTransactions = useRestriction(Permission.ReadUserTransactions);
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const redirect = !!currentUser?.id && membershipId === currentUser.id && !canReadTransactions;

  React.useEffect(() => {
    if (!redirect) return;
    navigation.navigate('Authenticated', {
      screen: 'Wallet',
      params: orderId
        ? { screen: 'WalletReceiptScreen', params: { orderId } }
        : { screen: 'WalletScreen' },
    } as never);
  }, [navigation, orderId, redirect]);

  return redirect;
}
