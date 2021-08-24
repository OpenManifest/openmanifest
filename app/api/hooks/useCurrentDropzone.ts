import { useQuery } from '@apollo/client';
import { startOfDay } from 'date-fns';
import gql from 'graphql-tag';
import * as React from 'react';
import { useAppSelector } from '../../state';
import { Query } from '../schema';
import useMutationUpdateUser from './useMutationUpdateUser';

export const QUERY_DROPZONE = gql`
  query QueryDropzone($dropzoneId: Int!, $earliestTimestamp: Int) {
    dropzone(id: $dropzoneId) {
      id
      lat
      lng
      name
      primaryColor
      secondaryColor
      planes {
        id
        name
        registration
      }
      ticketTypes {
        id
        name
      }

      currentConditions {
        id
        jumpRun
        temperature
        offsetDirection
        offsetMiles
        winds {
          altitude
          speed
          direction
        }
      }

      currentUser {
        id
        credits
        hasCredits
        hasExitWeight
        hasMembership
        hasReserveInDate
        hasRigInspection
        hasLicense
        permissions
        expiresAt

        role {
          id
          name
        }

        rigInspections {
          id
          isOk
          inspectedBy {
            id
            user {
              id
              name
            }
          }
          rig {
            id
          }
        }

        orders {
          edges {
            node {
              id
              title
              state
              createdAt
              title
              amount
              buyer {
                __typename
                ... on DropzoneUser {
                  id
                  user {
                    id
                    name
                  }
                }
                ... on Dropzone {
                  id
                  name
                }
              }
              seller {
                __typename
                ... on DropzoneUser {
                  id
                  user {
                    id
                    name
                  }
                }
                ... on Dropzone {
                  id
                  name
                }
              }
              item {
                title
                cost
              }
              item {
                title
                cost

                ... on Slot {
                  id

                  ticketType {
                    id
                    name
                    cost
                  }

                  extras {
                    id
                    name
                    cost
                  }
                }
                ... on TicketType {
                  id
                }
                ... on Extra {
                  id
                  name
                }
              }
              receipts {
                id
                transactions {
                  id
                  message
                  transactionType
                  status
                  createdAt
                  amount
                  sender {
                    ... on DropzoneUser {
                      id
                      user {
                        id
                        name
                      }
                    }
                    ... on Dropzone {
                      id
                      name
                    }
                  }
                  receiver {
                    ... on DropzoneUser {
                      id
                      user {
                        id
                        name
                      }
                    }
                    ... on Dropzone {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
        availableRigs {
          name
          id
          make
          model
          canopySize
          serial

          user {
            id
          }
        }

        user {
          id
          name
          exitWeight
          email
          phone
          pushToken
          image

          rigs {
            id
            name
            model
            make
            serial
            canopySize
            repackExpiresAt
            packingCard

            user {
              id
            }
          }
          jumpTypes {
            id
            name
          }
          license {
            id
            name
          }
        }
      }

      loads(earliestTimestamp: $earliestTimestamp) {
        edges {
          node {
            id
            name
            loadNumber
            isOpen
            maxSlots
            state
          }
        }
      }
    }
  }
`;
export default function useCurrentDropzone() {
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const pushToken = useAppSelector((root) => root.global.expoPushToken);

  const currentDropzone = useQuery<Query>(QUERY_DROPZONE, {
    variables: {
      dropzoneId,
      earliestTimestamp: startOfDay(new Date()).getTime() / 1000,
    },
    fetchPolicy: 'cache-and-network',
  });

  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: () => null,
    onError: () => null,
  });

  // Update remote push token if we have a local token, but no
  // token saved on the server. This is done so that the server
  // is able to send us push notifications
  React.useEffect(() => {
    const userId = currentDropzone?.data?.dropzone?.currentUser?.user?.id;
    const remoteToken = currentDropzone?.data?.dropzone?.currentUser?.user?.pushToken;
    const localToken = pushToken;

    if (!currentDropzone.loading && currentDropzone.called) {
      if (localToken && localToken !== remoteToken) {
        mutationUpdateUser.mutate({
          id: Number(userId),
          pushToken: localToken,
        });
      }
    }
  }, [
    pushToken,
    currentDropzone?.data?.dropzone?.currentUser?.user?.pushToken,
    currentDropzone?.data?.dropzone?.currentUser?.user?.id,
    currentDropzone.loading,
    currentDropzone.called,
    mutationUpdateUser,
  ]);

  return {
    ...currentDropzone,
    dropzone: currentDropzone?.data?.dropzone,
    currentUser: currentDropzone?.data?.dropzone?.currentUser,
  };
}
