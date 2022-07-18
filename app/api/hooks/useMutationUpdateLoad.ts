import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { LoadInput, UpdateLoadPayload } from '../schema';

const MUTATION_UPDATE_LOAD = gql`
  mutation UpdateLoad(
    $id: Int!
    $pilot: Int
    $gca: Int
    $plane: Int
    $isOpen: Boolean
    $loadMaster: Int
    $dispatchAt: Int
    $hasLanded: Boolean
  ) {
    updateLoad(
      input: {
        id: $id
        attributes: {
          pilot: $pilot
          gca: $gca
          plane: $plane
          isOpen: $isOpen
          loadMaster: $loadMaster
          dispatchAt: $dispatchAt
          hasLanded: $hasLanded
        }
      }
    ) {
      load {
        id
        name
        createdAt
        loadNumber
        dispatchAt
        hasLanded
        maxSlots
        isFull
        isOpen
        plane {
          id
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

          user {
            id
            name
          }
          ticketType {
            id
            name
            altitude
            isTandem
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
  }
`;

export default createMutation<{ id: number } & LoadInput, UpdateLoadPayload>(MUTATION_UPDATE_LOAD, {
  getPayload: (result) => result.updateLoad,
});
