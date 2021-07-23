import { useMutation } from '@apollo/client';
import * as React from 'react';
import { Avatar, Caption, Card, Divider, List, Paragraph } from 'react-native-paper';
import gql from 'graphql-tag';
import { Load, Mutation, Notification } from '../../../../api/schema';
import { differenceInMinutes, formatDistanceToNow } from 'date-fns';


const MUTATION_MARK_AS_SEEN = gql`
  mutation MarkAsSeen(
    $id: Int,
  ){
    updateNotification(input: {
      id: $id
      attributes: {
        isSeen: true,
      }
    }) {
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
  const [mutationMarkAsSeen, mutation] = useMutation<Mutation>(MUTATION_MARK_AS_SEEN);
  return (
    <Card style={{ margin: 8, borderRadius: 2, width: 370 }}>
      <List.Item
        title={`Manifest`}
        description={
          notification.message
        }
        style={{ width: "100%"}}
        left={
          (props) => <List.Icon {...props} icon="airplane" />
        }
        right={() =>
          <Caption>
            {formatDistanceToNow(notification.createdAt * 1000)}
          </Caption>
        }
      />
    </Card>
  );
}