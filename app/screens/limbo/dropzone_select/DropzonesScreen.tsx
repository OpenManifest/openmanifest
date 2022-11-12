import * as React from 'react';
import { StyleSheet, FlatList, Platform } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDropzonesContext } from 'app/api/crud';
import { actions, useAppDispatch, useAppSelector } from '../../../state';

import NoResults from '../../../components/NoResults';
import DropzoneCard from './DropzoneCard';

export default function DropzonesScreen() {
  const dispatch = useAppDispatch();
  const globalState = useAppSelector((root) => root.global);
  const { dropzones, loading, refetch } = useDropzonesContext();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dropzones}
        numColumns={Platform.OS === 'web' ? 3 : 2}
        refreshing={loading}
        keyExtractor={(item) => `dropzone-${item?.id}`}
        onRefresh={() => refetch()}
        style={styles.flatlist}
        contentContainerStyle={styles.content}
        ListEmptyComponent={() => (
          <NoResults title="No dropzones?" subtitle="You can set one up!" />
        )}
        renderItem={({ item: dropzone }) => (!dropzone ? null : <DropzoneCard {...{ dropzone }} />)}
      />
      <FAB
        style={[styles.fab, { backgroundColor: globalState.theme.colors.primary }]}
        small
        icon="plus"
        onPress={() => {
          dispatch(actions.forms.dropzone.reset());
          navigation.navigate('Wizards', { screen: 'DropzoneWizardScreen' });
        }}
        label="Create dropzone"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: 'flex',
    flexGrow: 1,
  },
  flatlist: { flex: 1, width: '100%', flexGrow: 1 },
  content: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dzIcon: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 32,
    right: 16,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  empty: {
    flex: 1,
    backgroundColor: '#FF1414',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
