import * as React from 'react';
import { useProfileDialogs } from './ProfileDialogs';

import { FAB, useTheme } from 'react-native-paper';
import { MembershipProfileFragment } from 'app/api/operations';
import { useNavigation } from '@react-navigation/native';
import { Permission } from 'app/api/schema.d';
import { useOperatorContext, useManifestContext } from 'app/providers';
import useRestriction from 'app/hooks/useRestriction';
import { Alert } from 'react-native';
import { MembershipsDocument, useArchiveUserMutation } from 'app/api/reflection';
import { errorColor, infoColor, successColor, warningColor } from 'app/constants/Colors';
import { useNotifications } from 'app/providers/notifications';
import { useUserNavigation } from '../useUserNavigation';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never;
type FABActions = PropsOf<typeof FAB.Group>['actions'];
interface IUserActionsButtonProps {
  membership?: MembershipProfileFragment | null;
  visible?: boolean;
}
export default function UserActionsButton(props: IUserActionsButtonProps) {
  const { membership, visible } = props;
  const { editUser, editMembership } = useProfileDialogs();
  const {
    operator: { currentUser },
  } = useOperatorContext();
  const [fabOpen, setFabOpen] = React.useState(false);
  const { dialogs } = useManifestContext();
  const notify = useNotifications();

  const navigation = useUserNavigation();
  const rootNavigator = useNavigation();
  const theme = useTheme();

  const onClickSetupWizard = React.useCallback(() => {
    if (membership) {
      rootNavigator.navigate('Wizards', {
        screen: 'UserWizardScreen',
        params: { index: undefined, membershipId: membership.id },
      });
    }
  }, [membership, rootNavigator]);

  const onClickAccessAndMembership = React.useCallback(() => {
    if (!membership) {
      return;
    }
    editMembership();
  }, [membership, editMembership]);

  const onClickTransactions = React.useCallback(() => {
    if (!membership?.id) {
      return;
    }
    navigation.navigate('OrdersScreen', { userId: membership?.id });
  }, [membership?.id, navigation]);

  const onClickEquipment = React.useCallback(() => {
    if (!membership?.id) {
      return;
    }
    navigation.navigate('EquipmentScreen', { userId: membership?.id });
  }, [membership?.id, navigation]);

  const onClickAddFunds = React.useCallback(() => {
    if (membership) {
      dialogs.credits.open({ membership });
    }
  }, [dialogs.credits, membership]);

  const onClickEdit = React.useCallback(() => {
    if (membership?.user) {
      editUser();
    }
  }, [membership?.user, editUser]);

  const isSelf = React.useMemo(
    () => currentUser?.id === membership?.id,
    [currentUser?.id, membership?.id]
  );
  const canAddTransaction = useRestriction(Permission.CreateUserTransaction);
  const canViewOthersTransactions = useRestriction(Permission.ReadUserTransactions);
  const canUpdateUsers = useRestriction(Permission.UpdateUser);
  const canDeleteUsers = useRestriction(Permission.DeleteUser);

  const [deleteUser] = useArchiveUserMutation();

  const onDeleteUser = React.useCallback(() => {
    Alert.alert(
      isSelf ? 'Delete My Account' : `Delete ${membership?.user?.name}`,
      isSelf
        ? 'Are you sure you want to delete your account? You will be logged out'
        : 'Are you sure you want to delete this user ? ',
      [
        { style: 'cancel', text: 'Cancel', onPress: () => null },
        {
          style: 'destructive',
          text: 'Yes, delete',
          onPress: async () => {
            try {
              const { data } = await deleteUser({
                variables: {
                  id: Number(membership?.id),
                },
                refetchQueries: [MembershipsDocument],
              });

              data?.deleteUser?.errors?.forEach((message) => {
                notify.success(message);
              });
              if (data?.deleteUser?.membership?.id) {
                notify.success(`${membership?.user?.name} has been removed`);
              }

              navigation.goBack();
            } catch {}
          },
        },
      ]
    );
  }, [deleteUser, membership?.id, membership?.user?.name, isSelf, navigation, notify]);

  const fabActions = React.useMemo(
    () =>
      [
        isSelf && canUpdateUsers
          ? {
              icon: 'pencil',
              label: 'Edit',
              onPress: onClickEdit,
            }
          : null,
        {
          icon: 'account-convert',
          label: 'Setup Wizard',
          color: infoColor,
          onPress: onClickSetupWizard,
        },
        canUpdateUsers
          ? {
              icon: 'lock',
              label: 'Access & Membership',
              color: warningColor,
              onPress: onClickAccessAndMembership,
            }
          : null,
        canAddTransaction
          ? {
              icon: 'cash-plus',
              label: 'Add Funds',
              color: successColor,
              onPress: onClickAddFunds,
            }
          : null,
        isSelf || canViewOthersTransactions
          ? {
              icon: 'account-cash',
              label: 'Manage Transactions',
              onPress: onClickTransactions,
            }
          : null,
        {
          icon: 'parachute',
          label: 'Manage Equipment',
          onPress: onClickEquipment,
        },
        canDeleteUsers
          ? {
              icon: 'account-off',
              label: 'Delete user',
              onPress: onDeleteUser,
              color: errorColor,
            }
          : null,
      ].filter(Boolean) as FABActions,
    [
      canAddTransaction,
      canDeleteUsers,
      canUpdateUsers,
      canViewOthersTransactions,
      isSelf,
      onClickAccessAndMembership,
      onClickAddFunds,
      onClickEdit,
      onClickEquipment,
      onClickSetupWizard,
      onClickTransactions,
      onDeleteUser,
    ]
  );

  return (
    <FAB.Group
      testID="user-profile-fab"
      open={fabOpen}
      visible={(!!membership?.id && visible) || false}
      icon={fabOpen ? 'close' : 'account-edit'}
      fabStyle={{
        marginLeft: 16,
        marginBottom: 16,
        backgroundColor: theme.colors.primary,
      }}
      onStateChange={({ open }) => setFabOpen(open)}
      actions={fabActions.map((action) => ({
        ...action,
        labelMaxFontSizeMultiplier: CHROME_MAX_FONT_SIZE_MULTIPLIER,
      }))}
    />
  );
}
