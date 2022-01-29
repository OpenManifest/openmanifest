import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import CreditsSheet from 'app/components/dialogs/CreditsDialog/Credits';

import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { useQueryDropzoneUserProfile } from 'app/api/reflection';
import OrderCard from './OrderCard';

export default function TransactionsScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();
  const route = useRoute<{ key: string; name: string; params: { userId: string } }>();
  const { data, loading, refetch } = useQueryDropzoneUserProfile({
    variables: {
      dropzoneId: Number(state?.currentDropzoneId),
      dropzoneUserId: Number(route?.params?.userId) || Number(currentUser?.id),
    },
  });
  const dropzoneUser = React.useMemo(
    () => data?.dropzone?.dropzoneUser,
    [data?.dropzone?.dropzoneUser]
  );

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  React.useEffect(() => {
    if (dropzoneUser?.user?.name && dropzoneUser?.id !== currentUser?.id) {
      const [firstName] = dropzoneUser.user?.name.split(/\s/);
      navigation.setOptions({ title: `${firstName}'s Transactions` });
    } else {
      navigation.setOptions({ title: 'Your Transactions' });
    }
  }, [currentUser?.id, dropzoneUser?.id, dropzoneUser?.user?.name, navigation]);

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  return (
    <>
      {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}

      <FlatList
        style={styles.flatList}
        data={dropzoneUser?.orders?.edges || []}
        refreshing={false}
        onRefresh={refetch}
        renderItem={({ item }) => (
          !item?.node ? null :
          <OrderCard
            onPress={() =>
              !item?.node ? null : navigation.navigate('Authenticated', {
                screen: 'Drawer',
                params: {
                  screen: 'Manifest',
                  params: {
                    screen: 'OrderScreen',
                    params: { order: item?.node }
                  }
                }
              })
            }
            order={item?.node}
            {...{ dropzoneUser }}
          />
        )}
      />

      <CreditsSheet
        onClose={() => dispatch(actions.forms.credits.setOpen(false))}
        onSuccess={() => dispatch(actions.forms.credits.setOpen(false))}
        open={forms.credits.open}
        dropzoneUser={dropzoneUser || undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flatList: { flex: 1, paddingTop: 0 },
});
