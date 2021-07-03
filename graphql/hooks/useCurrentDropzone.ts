import { useQuery } from "@apollo/client";
import { startOfDay } from "date-fns";
import gql from 'graphql-tag';
import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../redux";
import { Query } from "../schema";
import useMutationUpdateUser from "./useMutationUpdateUser";

export const QUERY_DROPZONE = gql`
  query QueryDropzone($dropzoneId: Int!, $earliestTimestamp: Int) {
    dropzone(id: $dropzoneId) {
      id
      name
      primaryColor,
      secondaryColor,
      planes {
        id
        name
        registration
      }
      ticketTypes {
        id
        name
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

        transactions {
          edges {
            node {
              id
              status
              amount
            }
          }
        }

        user {
          id
          name
          exitWeight
          email
          phone
          pushToken

          rigs {
            id
            model
            make
            serial
            canopySize
            repackExpiresAt
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
            isFull
          }
        }
      }
    }
  }
`;
export default function useCurrentDropzone() {
  const dropzoneId = useAppSelector(state => state.global.currentDropzoneId);
  const pushToken = useAppSelector(state => state.global.expoPushToken);
  const dispatch = useAppDispatch();

  const currentDropzone = useQuery<Query>(QUERY_DROPZONE, {
    variables: {
      dropzoneId: dropzoneId,
      earliestTimestamp: startOfDay(new Date()).getTime() / 1000
    },
    fetchPolicy: "cache-first"
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
        })
      }
    }

  }, [pushToken, currentDropzone?.data?.dropzone?.currentUser?.user?.pushToken]);

  return {
    ...currentDropzone,
    dropzone: currentDropzone?.data?.dropzone,
    currentUser: currentDropzone?.data?.dropzone?.currentUser,
  }
}