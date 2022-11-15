import { useIsFocused } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
// import gql from 'graphql-tag';

import { FlatList } from 'react-native-gesture-handler';
import { NotificationType } from 'app/api/schema.d';
import { useNotificationsLazyQuery } from 'app/api/reflection';
import { NotificationsQueryVariables } from 'app/api/operations';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useAppSelector } from '../../../../state';
import NoResults from '../../../../components/NoResults';

import ManifestedCard from './Cards/Manifested';
import BoardingCallNotification from './Cards/BoardingCall';
import FundsNotification from './Cards/Funds';
import RigInspectionNotification from './Cards/RigInspection';
import PermissionNotification from './Cards/Permission';
import PublicationRequestNotification from './Cards/PublicationRequest';

export default function NotificationScreen() {
  const state = useAppSelector((root) => root.global);
  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  const [getNotifications, query] = useNotificationsLazyQuery();
  const { data, loading } = query;
  const variables: NotificationsQueryVariables | undefined = React.useMemo(
    () => (!dropzone?.id ? undefined : { dropzoneId: dropzone?.id }),
    [dropzone?.id]
  );

  const fetchNotifications = React.useCallback(() => {
    if (variables?.dropzoneId) {
      getNotifications({ variables, fetchPolicy: 'cache-and-network' });
    }
  }, [getNotifications, variables]);

  React.useEffect(() => {
    if (!loading && query?.variables?.dropzoneId !== variables?.dropzoneId) {
      getNotifications({ variables });
    }
  }, [getNotifications, loading, query?.variables?.dropzoneId, variables]);

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused && fetchNotifications) {
      fetchNotifications();
    }
  }, [isFocused, fetchNotifications]);

  // const [mutationMarkAsSeen, mutation] = useMutation<Mutation>(MUTATION_MARK_AS_SEEN);
  console.debug('Notifications', data?.dropzone?.currentUser?.notifications?.edges);

  return (
    <View style={StyleSheet.absoluteFill}>
      {loading && (
        <ProgressBar color={state.theme.colors.primary} indeterminate visible={loading} />
      )}
      <FlatList
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <NoResults title="No notifications" subtitle="Notifications will show up here" />
          </View>
        )}
        contentContainerStyle={styles.content}
        onRefresh={fetchNotifications}
        data={data?.dropzone?.currentUser?.notifications?.edges}
        refreshing={loading}
        numColumns={1}
        keyExtractor={(edge) => `notification-${edge?.node?.id}`}
        style={StyleSheet.absoluteFill}
        renderItem={({ item: edge }) => {
          console.debug('Rendering notification ', edge?.node?.notificationType);
          switch (edge?.node?.notificationType) {
            case NotificationType.BoardingCall:
              return (
                <BoardingCallNotification key={edge.node.id} notification={edge.node as never} />
              );
            case NotificationType.UserManifested:
              console.debug('Renderign manifest card');
              return <ManifestedCard key={edge.node.id} notification={edge.node as never} />;
            case NotificationType.CreditsUpdated:
              return <FundsNotification key={edge.node.id} notification={edge.node as never} />;
            case NotificationType.RigInspectionRequested:
            case NotificationType.RigInspectionCompleted:
              return (
                <RigInspectionNotification key={edge.node.id} notification={edge.node as never} />
              );
            case NotificationType.PermissionGranted:
            case NotificationType.PermissionRevoked:
              return (
                <PermissionNotification key={edge.node.id} notification={edge.node as never} />
              );
            case NotificationType.PublicationRequested:
              return (
                <PublicationRequestNotification
                  key={edge.node.id}
                  notification={edge.node as never}
                />
              );
            default:
              return null;
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 56,
    paddingHorizontal: 4,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  empty: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    flexGrow: 1,
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
