import * as React from 'react';
import { StyleSheet, FlatList, Dimensions, View } from 'react-native';
import { Card, Title, FAB, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DropzoneExtensiveFragment } from 'app/api/operations';
import { useQueryDropzones } from 'app/api/reflection';
import { actions, useAppDispatch, useAppSelector } from '../../../state';

import NoResults from '../../../components/NoResults';

export default function DropzonesScreen() {
  const dispatch = useAppDispatch();
  const globalState = useAppSelector((root) => root.global);
  const { data, loading, refetch } = useQueryDropzones();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data?.dropzones?.edges || []}
        numColumns={2}
        refreshing={loading}
        onRefresh={() => refetch()}
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <NoResults title="No dropzones?" subtitle="You can set one up!" />
        )}
        renderItem={({ item }) => {
          return (
            <Card
              style={{
                width: Dimensions.get('window').width / 2 - 32,
                margin: 8,
              }}
              onPress={async () => {
                if (item?.node) {
                  const shouldPushRoute = !!globalState.currentDropzoneId;
                  dispatch(actions.global.setDropzone(item.node as DropzoneExtensiveFragment));

                  if (shouldPushRoute) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    navigation.replace('Authenticated', {
                      screen: 'HomeScreen',
                    });
                  }
                }
              }}
            >
              {item?.node?.banner ? (
                <Card.Cover source={{ uri: item?.node?.banner as string }} />
              ) : (
                <View
                  style={[
                    styles.dzIcon,
                    { backgroundColor: item?.node?.primaryColor || undefined },
                  ]}
                >
                  <Avatar.Icon
                    style={{ backgroundColor: item?.node?.secondaryColor || undefined }}
                    icon="airplane-takeoff"
                  />
                </View>
              )}

              <Card.Content>
                <Title>{item?.node?.name}</Title>
              </Card.Content>
            </Card>
          );
        }}
      />

      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => {
          dispatch(actions.forms.plane.reset());
          dispatch(actions.forms.ticketType.reset());
          dispatch(actions.forms.dropzone.reset());
          navigation.navigate('DropzoneSetupScreen');
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
