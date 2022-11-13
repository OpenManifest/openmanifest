import * as React from 'react';

import { FAB, useTheme } from 'react-native-paper';
import { actions, useAppDispatch } from 'app/state';
import { DropzoneUserProfileFragment } from 'app/api/operations';
import { useNavigation } from '@react-navigation/core';
import { Permission } from 'app/api/schema.d';
import { useDropzoneContext, useManifestContext } from 'app/providers';
import useRestriction from 'app/hooks/useRestriction';
import { Alert } from 'react-native';
import { DropzoneUsersDocument, useArchiveUserMutation } from 'app/api/reflection';
import { errorColor, infoColor, successColor, warningColor } from 'app/constants/Colors';
import { useNotifications } from 'app/providers/notifications';
import { useUserNavigation } from '../useUserNavigation';

type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never;
type FABActions = PropsOf<typeof FAB.Group>['actions'];
interface IUserActionsButtonProps {
  dropzoneUser?: DropzoneUserProfileFragment | null;
  visible?: boolean;
}
export default function UserActionsButton(props: IUserActionsButtonProps) {
  const { dropzoneUser, visible } = props;
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();
  const [fabOpen, setFabOpen] = React.useState(false);
  const { dialogs } = useManifestContext();
  const notify = useNotifications();

  const dispatch = useAppDispatch();
  const navigation = useUserNavigation();
  const rootNavigator = useNavigation();
  const theme = useTheme();

  const onClickSetupWizard = React.useCallback(() => {
    if (dropzoneUser) {
      dispatch(actions.forms.user.setOriginal(dropzoneUser));
      if (dropzoneUser?.user?.rigs?.length) {
        dispatch(actions.forms.rig.setOriginal(dropzoneUser.user.rigs[0]));
      }
      rootNavigator.navigate('Wizards', {
        screen: 'UserWizardScreen',
        params: { index: undefined },
      });
    }
  }, [dispatch, dropzoneUser, rootNavigator]);

  const onClickAccessAndMembership = React.useCallback(() => {
    if (!dropzoneUser) {
      return;
    }
    dispatch(actions.forms.dropzoneUser.setOpen(dropzoneUser));
  }, [dispatch, dropzoneUser]);

  const onClickTransactions = React.useCallback(() => {
    if (!dropzoneUser?.id) {
      return;
    }
    navigation.navigate('OrdersScreen', { userId: dropzoneUser?.id });
  }, [dropzoneUser?.id, navigation]);

  const onClickEquipment = React.useCallback(() => {
    if (!dropzoneUser?.id) {
      return;
    }
    navigation.navigate('EquipmentScreen', { userId: dropzoneUser?.id });
  }, [dropzoneUser?.id, navigation]);

  const onClickAddFunds = React.useCallback(() => {
    if (dropzoneUser) {
      dialogs.credits.open({ dropzoneUser });
    }
  }, [dialogs.credits, dropzoneUser]);

  const onClickEdit = React.useCallback(() => {
    if (dropzoneUser?.user) {
      dispatch(actions.forms.user.setOpen(dropzoneUser));
    }
  }, [dispatch, dropzoneUser]);

  const isSelf = React.useMemo(
    () => currentUser?.id === dropzoneUser?.id,
    [currentUser?.id, dropzoneUser?.id]
  );
  const canAddTransaction = useRestriction(Permission.CreateUserTransaction);
  const canViewOthersTransactions = useRestriction(Permission.ReadUserTransactions);
  const canUpdateUsers = useRestriction(Permission.UpdateUser);
  const canDeleteUsers = useRestriction(Permission.DeleteUser);

  const [deleteUser] = useArchiveUserMutation();

  const onDeleteUser = React.useCallback(() => {
    Alert.alert(
      isSelf ? 'Delete My Account' : `Delete ${dropzoneUser?.user?.name}`,
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
                  id: Number(dropzoneUser?.id),
                },
                refetchQueries: [DropzoneUsersDocument],
              });

              data?.deleteUser?.errors?.forEach((message) => {
                notify.success(message);
              });
              if (data?.deleteUser?.dropzoneUser?.id) {
                notify.success(`${dropzoneUser?.user?.name} has been removed`);
              }

              navigation.goBack();
            } catch (e) {
              console.log(e);
            }
          },
        },
      ]
    );
  }, [deleteUser, dropzoneUser?.id, dropzoneUser?.user?.name, isSelf, navigation, notify]);

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
      visible={(!!dropzoneUser?.id && visible) || false}
      icon={fabOpen ? 'close' : 'account-edit'}
      fabStyle={{
        marginLeft: 16,
        marginBottom: 16,
        backgroundColor: theme.colors.primary,
      }}
      onStateChange={({ open }) => setFabOpen(open)}
      actions={fabActions}
    />
  );
}
