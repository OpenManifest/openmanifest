import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { DataTable, ProgressBar } from 'react-native-paper';
import format from 'date-fns/format';

import { actions, useAppDispatch, useAppSelector } from '../../../state';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import CreditsSheet from '../../../components/dialogs/CreditsDialog/Credits';

import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';
import useDropzoneUser from '../../../api/hooks/useDropzoneUser';

export default function ProfileScreen() {
  const state = useAppSelector((root) => root.global);
  const forms = useAppSelector((root) => root.forms);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();
  const { dropzoneUser, loading, refetch } = useDropzoneUser(
    currentUser?.id ? Number(currentUser.id) : undefined
  );

  const isFocused = useIsFocused();
  const navigation = useNavigation();
  React.useEffect(() => navigation.setOptions({ title: 'Transactions' }), [navigation]);

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  return (
    <>
      {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}
      <ScrollableScreen
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Time</DataTable.Title>
            <DataTable.Title>Type</DataTable.Title>
            <DataTable.Title>Message</DataTable.Title>
            <DataTable.Title numeric>Amount</DataTable.Title>
          </DataTable.Header>
          {dropzoneUser?.transactions?.edges?.map((edge) => (
            <DataTable.Row key={`transaction-${edge?.node?.id}`}>
              <DataTable.Cell>
                <Text
                  style={{
                    fontSize: 12,
                    fontStyle: 'italic',
                    color: '#999999',
                  }}
                >
                  {!edge?.node?.createdAt
                    ? null
                    : format(edge?.node?.createdAt * 1000, 'yyyy/MM/dd hh:mm')}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Text
                  style={{
                    fontSize: 12,
                    fontStyle: 'italic',
                    color: '#999999',
                  }}
                >
                  {edge?.node?.status}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell>{edge?.node?.message}</DataTable.Cell>
              <DataTable.Cell numeric>{edge?.node?.amount}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </ScrollableScreen>

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
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 56,
    paddingHorizontal: 0,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  chip: {
    margin: 1,
    backgroundColor: 'transparent',
    minHeight: 23,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  chipTitle: {
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 12,
    lineHeight: 24,
    textAlignVertical: 'center',
  },
});
