import { useQuery } from "@apollo/client";
import { startOfDay } from "date-fns";
import gql from 'graphql-tag';
import * as React from "react";
import { useAppSelector } from "../../redux";
import { Query } from "../schema";

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

  const currentDropzone = useQuery<Query>(QUERY_DROPZONE, {
    variables: {
      dropzoneId: dropzoneId,
      earliestTimestamp: startOfDay(new Date()).getTime() / 1000
    },
    fetchPolicy: "cache-first"
  });

  return {
    ...currentDropzone,
    dropzone: currentDropzone?.data?.dropzone,
    currentUser: currentDropzone?.data?.dropzone?.currentUser,
  }
}