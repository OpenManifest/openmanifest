import { useLazyQuery, useQuery } from "@apollo/client";
import gql from 'graphql-tag';
import * as React from "react";
import { useAppSelector } from "../../state";
import { Query } from "../schema";
import useCurrentDropzone from "./useCurrentDropzone";

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

              resource {
                ...on Load {
                  id
                  loadNumber
                  dispatchAt
                }
                ...on Transaction {
                  id
                  amount
                  message
                  status
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
  const dropzoneId = useAppSelector(state => state.global.currentDropzoneId);

  const query = useQuery<Pick<Query, "dropzone">>(QUERY_DROPZONE_USER_NOTIFICATIONS, {
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