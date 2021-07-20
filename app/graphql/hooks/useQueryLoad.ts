import gql from "graphql-tag";
import { createQuery } from "../createQuery";
import { Query } from "../schema";

export const QUERY_LOAD = gql`
  query QueryLoad($id: Int!) {
    load(id: $id) {
      id
      name
      createdAt
      dispatchAt
      hasLanded
      maxSlots
      loadNumber
      isFull
      state
      isOpen
      plane {
        id
        maxSlots
        name
      }
      gca {
        id
        user {
          id
          name
        }
      }
      pilot {
        id
        user {
          id
          name
        }
      }
      loadMaster {
        id
        user {
          id
          name
        }
      }
      slots {
        id
        createdAt
        exitWeight
        passengerName
        passengerExitWeight
        
        dropzoneUser {
          id
          user {
            id
            name
            exitWeight
          }
        }
        ticketType {
          id
          name
          altitude
          isTandem

          extras {
            id
            name
            cost
          }
        }
        jumpType {
          id
          name
        }
        extras {
          id
          name
        }
      }
    }
  }
`;

export default createQuery<Query["load"], {
  id: number
 }>(QUERY_LOAD, {
   getPayload: (query) => query?.load,
 });