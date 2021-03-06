import { useIsFocused } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
// import gql from 'graphql-tag';

import { FlatList } from 'react-native-gesture-handler';
import { NotificationType } from 'app/api/schema.d';
import { useAppSelector } from '../../../../state';
import useNotifications from '../../../../api/hooks/useNotifications';
import NoResults from '../../../../components/NoResults';

import ManifestedCard from './Cards/Manifested';
import BoardingCallNotification from './Cards/BoardingCall';
import FundsNotification from './Cards/Funds';
import RigInspectionNotification from './Cards/RigInspection';
import PermissionNotification from './Cards/Permission';
import PublicationRequestNotification from './Cards/PublicationRequest';

/* const MUTATION_MARK_AS_SEEN = gql`
  mutation MarkAsSeen($id: Int) {
    updateNotification(input: { id: $id, attributes: { isSeen: true } }) {
      notification {
        id
        isSeen
        message
        notificationType
        receivedBy {
          notifications {
            edges {
              node {
                id
                message
                isSeen
                notificationType
              }
            }
          }
        }
      }
    }
  }
`;
*/

export default function ProfileScreen() {
  const state = useAppSelector((root) => root.global);
  const { notifications, loading, refetch } = useNotifications();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  // const [mutationMarkAsSeen, mutation] = useMutation<Mutation>(MUTATION_MARK_AS_SEEN);

  return (
    <>
      {loading && (
        <ProgressBar color={state.theme.colors.primary} indeterminate visible={loading} />
      )}
      {notifications?.edges?.length ? null : (
        <View style={styles.empty}>
          <NoResults title="No notifications" subtitle="Notifications will show up here" />
        </View>
      )}
      <FlatList
        data={notifications?.edges}
        numColumns={1}
        keyExtractor={(edge) => `notification-${edge?.node?.id}`}
        style={{
          flex: 1,
        }}
        renderItem={({ item: edge }) => {
          switch (edge?.node?.notificationType) {
            case NotificationType.BoardingCall:
              return <BoardingCallNotification key={edge.node.id} notification={edge.node} />;
            case NotificationType.UserManifested:
              return <ManifestedCard key={edge.node.id} notification={edge.node} />;
            case NotificationType.CreditsUpdated:
              return <FundsNotification key={edge.node.id} notification={edge.node} />;
            case NotificationType.RigInspectionRequested:
            case NotificationType.RigInspectionCompleted:
              return <RigInspectionNotification key={edge.node.id} notification={edge.node} />;
            case NotificationType.PermissionGranted:
            case NotificationType.PermissionRevoked:
              return <PermissionNotification key={edge.node.id} notification={edge.node} />;
            case NotificationType.PublicationRequested:
              return <PublicationRequestNotification key={edge.node.id} notification={edge.node} />;
            default:
              return null;
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 56,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  empty: {
    ...StyleSheet.absoluteFillObject,
    flexGrow: 1,
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
