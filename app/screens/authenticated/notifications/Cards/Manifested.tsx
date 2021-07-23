import { useMutation } from '@apollo/client';
import * as React from 'react';
import { Caption, Card, List } from 'react-native-paper';
import gql from 'graphql-tag';
import { formatDistanceToNow } from 'date-fns';
import { Mutation, Notification } from '../../../../api/schema';

const MUTATION_MARK_AS_SEEN = gql`
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

interface INotification {
  notification: Notification;
}

export default function ManifestedNotification(props: INotification) {
  const { notification } = props;
  return (
    <Card style={{ margin: 8, borderRadius: 2, width: 370 }}>
      <List.Item
        title="Manifest"
        description={notification.message}
        style={{ width: '100%' }}
        left={(p) => <List.Icon {...p} icon="airplane" />}
        right={() => <Caption>{formatDistanceToNow(notification.createdAt * 1000)}</Caption>}
      />
    </Card>
  );
}
