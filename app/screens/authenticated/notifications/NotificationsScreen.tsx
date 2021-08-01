import { useIsFocused } from '@react-navigation/core';
import * as React from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
// import gql from 'graphql-tag';

import { useAppSelector } from '../../../state';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import useNotifications from '../../../api/hooks/useNotifications';
import NoResults from '../../../components/NoResults';

import ManifestedCard from './Cards/Manifested';
import BoardingCallNotification from './Cards/BoardingCall';

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
      {loading && <ProgressBar color={state.theme.colors.accent} indeterminate visible={loading} />}
      <ScrollableScreen
        style={{ backgroundColor: '#F4F5F5' }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        {!notifications?.edges?.length ? (
          <NoResults title="No notifications" subtitle="Notifications will show up here" />
        ) : (
          notifications?.edges?.map((edge) => {
            switch (edge?.node?.notificationType) {
              case 'boarding_call':
                return <BoardingCallNotification notification={edge.node} />;
              case 'user_manifested':
                return <ManifestedCard notification={edge.node} />;

              default:
                return null;
            }
          })
        )}
      </ScrollableScreen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 56,
    alignItems: 'center',
    paddingHorizontal: 16,
    marginHorizontal: 16,
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
