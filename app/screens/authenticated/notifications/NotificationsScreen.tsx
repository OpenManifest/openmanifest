import { useIsFocused } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
// import gql from 'graphql-tag';

import { FlatList } from 'react-native-gesture-handler';
import { useAppSelector } from '../../../state';
import useNotifications from '../../../api/hooks/useNotifications';
import NoResults from '../../../components/NoResults';

import ManifestedCard from './Cards/Manifested';
import BoardingCallNotification from './Cards/BoardingCall';
import FundsNotification from './Cards/Funds';
import RigInspectionNotification from './Cards/RigInspection';
import PermissionNotification from './Cards/Permission';

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

  const { currentUser } = useCurrentDropzone();

  return (
    <>
      {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}
      {notifications?.edges?.length ? null : (
        <View style={styles.empty}>
          <NoResults title="No notifications" subtitle="Notifications will show up here" />
        </View>
      )}
      <FlatList
        data={notifications?.edges}
        numColumns={1}
        style={{
          flex: 1,
        }}
        renderItem={({ item: edge }) => {
          switch (edge?.node?.notificationType) {
            case 'boarding_call':
              return <BoardingCallNotification notification={edge.node} />;
            case 'user_manifested':
              return <ManifestedCard notification={edge.node} />;
            case 'credits_updated':
              return <FundsNotification notification={edge.node} />;
            case 'rig_inspection_requested':
            case 'rig_inspection_completed':
              return <RigInspectionNotification notification={edge.node} />;
            case 'permission_granted':
            case 'permission_revoked':
              return <PermissionNotification notification={edge.node} />;
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
