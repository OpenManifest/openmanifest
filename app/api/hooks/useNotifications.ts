import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { useAppSelector } from '../../state';
import { Query } from '../schema';

const QUERY_DROPZONE_USER_NOTIFICATIONS = gql`
  query QueryNotifications($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id

      currentUser {
        id

        notifications {
          edges {
            node {
              id
              message
              notificationType
              createdAt
              sentBy {
                id
                user {
                  id
                  name
                }
              }

              resource {
                ... on Load {
                  id
                  loadNumber
                  dispatchAt
                  state
                }
                ... on Transaction {
                  id
                  amount
                  message
                  status
                }

                ... on Slot {
                  id
                  load {
                    id
                    loadNumber
                    dispatchAt
                    state
                  }
                }

                ... on Rig {
                  id
                  user {
                    id
                    name
                  }
                  rigInspections(dropzoneId: $dropzoneId) {
                    id
                    createdAt
                    inspectedBy {
                      id
                      user {
                        id
                        name
                      }
                    }
                  }
                }

                ... on RigInspection {
                  id
                  createdAt
                  inspectedBy {
                    id
                    user {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Returns current user if no ID is provided
export default function useNotifications() {
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);

  const query = useQuery<Pick<Query, 'dropzone'>>(QUERY_DROPZONE_USER_NOTIFICATIONS, {
    variables: {
      dropzoneId,
    },
    pollInterval: 30000,
  });

  return {
    ...query,
    notifications: query?.data?.dropzone?.currentUser.notifications,
  };
}
