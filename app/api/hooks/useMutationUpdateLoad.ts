import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { LoadInput, UpdateLoadPayload } from '../schema';

const MUTATION_UPDATE_LOAD = gql`
  mutation UpdateLoad(
    $id: Int!
    $pilotId: Int
    $gcaId: Int
    $planeId: Int
    $isOpen: Boolean
    $loadMasterId: Int
    $dispatchAt: Int
    $hasLanded: Boolean
  ) {
    updateLoad(
      input: {
        id: $id
        attributes: {
          pilotId: $pilotId
          gcaId: $gcaId
          planeId: $planeId
          isOpen: $isOpen
          loadMasterId: $loadMasterId
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
  fieldErrorMap: {
    pilotId: 'pilot',
    gcaId: 'gca',
    planeId: 'plane',
    loadMasterId: 'loadMaster',
  },
});
