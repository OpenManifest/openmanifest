import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import ScreenHeader from 'app/navigation/ScreenHeader';
import { AppSignalBoundary } from 'app/components/app_signal';
import ReceiptScreen, { WalletReceiptRoute } from 'app/features/wallet/ReceiptScreen';
import WalletScreen from 'app/features/wallet/WalletScreen';

export type WalletRoutes = { WalletScreen: undefined } & WalletReceiptRoute;

const Wallet = createStackNavigator<WalletRoutes>();

/** The member's money: the balance and what they paid, with a receipt for each order */
export default function WalletTab() {
  const { t } = useTranslation('common');
  return (
    <AppSignalBoundary>
      <Wallet.Navigator
        screenOptions={{
          headerShown: true,
          header: (props) => <ScreenHeader {...props} hideWarnings />,
          cardStyle: { flex: 1 },
        }}
        initialRouteName="WalletScreen"
      >
        <Wallet.Screen
          name="WalletScreen"
          component={WalletScreen}
          options={{ title: t('destinations.wallet') }}
        />
        <Wallet.Screen
          name="WalletReceiptScreen"
          component={ReceiptScreen}
          options={{ title: t('wallet.receipt.title') }}
        />
      </Wallet.Navigator>
    </AppSignalBoundary>
  );
}
