import * as React from 'react';

import { FAB } from 'react-native-paper';
import { actions, useAppDispatch } from 'app/state';
import { DropzoneUserProfileFragment } from 'app/api/operations';
import { useNavigation } from '@react-navigation/core';
import { Permission } from 'app/api/schema.d';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import useRestriction from 'app/hooks/useRestriction';
import { Alert } from 'react-native';
import { DropzoneUsersDocument, useArchiveUserMutation } from 'app/api/reflection';
import { errorColor, infoColor, successColor, warningColor } from 'app/constants/Colors';

type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never;
type FABActions = PropsOf<typeof FAB.Group>['actions'];
interface IUserActionsButtonProps {
  dropzoneUser?: DropzoneUserProfileFragment | null;
}
export default function UserActionsButton(props: IUserActionsButtonProps) {
  const { dropzoneUser } = props;
  const { currentUser } = useCurrentDropzone();
  const [fabOpen, setFabOpen] = React.useState(false);

  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const onClickSetupWizard = React.useCallback(() => {
    if (dropzoneUser) {
      dispatch(actions.forms.user.setOriginal(dropzoneUser));
      if (dropzoneUser?.user?.rigs?.length) {
        dispatch(actions.forms.rig.setOriginal(dropzoneUser.user.rigs[0]));
      }
      navigation.navigate('UserSetupWizard');
    }
  }, [dispatch, dropzoneUser, navigation]);

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
    navigation.navigate('TransactionsScreen', { userId: dropzoneUser?.id });
  }, [dropzoneUser?.id, navigation]);

  const onClickEquipment = React.useCallback(() => {
    if (!dropzoneUser?.id) {
      return;
    }
    navigation.navigate('EquipmentScreen', { userId: dropzoneUser?.id });
  }, [dropzoneUser?.id, navigation]);

  const onClickAddFunds = React.useCallback(() => {
    if (dropzoneUser) {
      dispatch(actions.forms.credits.setOpen(dropzoneUser));
    }
  }, [dispatch, dropzoneUser]);

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
                dispatch(
                  actions.notifications.showSnackbar({
                    message,
                    variant: 'success',
                  })
                );
              });
              if (data?.deleteUser?.dropzoneUser?.id) {
                dispatch(
                  actions.notifications.showSnackbar({
                    message: `${dropzoneUser?.user?.name} has been removed`,
                    variant: 'success',
                  })
                );
              }

              navigation.goBack();
            } catch (e) {
              console.log(e);
            }
          },
        },
      ]
    );
  }, [deleteUser, dispatch, dropzoneUser?.id, dropzoneUser?.user?.name, isSelf, navigation]);

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
      visible={!!dropzoneUser?.id}
      icon={fabOpen ? 'close' : 'account-cog'}
      fabStyle={{
        marginLeft: 16,
        marginBottom: 16,
      }}
      onStateChange={({ open }) => setFabOpen(open)}
      actions={fabActions}
    >
      Manage
    </FAB.Group>
  );
}
