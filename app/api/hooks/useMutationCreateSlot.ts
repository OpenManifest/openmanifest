import gql from 'graphql-tag';
import { createMutation, isRequired } from '../createMutation';
import { SlotInput, CreateSlotPayload } from '../schema';

const MUTATION_CREATE_SLOT = gql`
  mutation CreateSlot(
    $jumpTypeId: Int
    $extraIds: [Int!]
    $loadId: Int
    $rigId: Int
    $ticketTypeId: Int
    $dropzoneUserId: Int
    $exitWeight: Float
    $passengerName: String
    $passengerExitWeight: Float
  ) {
    createSlot(
      input: {
        attributes: {
          jumpTypeId: $jumpTypeId
          extraIds: $extraIds
          loadId: $loadId
          rigId: $rigId
          ticketTypeId: $ticketTypeId
          dropzoneUserId: $dropzoneUserId
          exitWeight: $exitWeight
          passengerExitWeight: $passengerExitWeight
          passengerName: $passengerName
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      slot {
        id
        jumpType {
          id
          name
        }
        extras {
          id
          name
        }
        exitWeight
        load {
          id
          name
          createdAt
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
            user {
              id
              name
            }
            passengerName
            passengerExitWeight
            ticketType {
              id
              name
              isTandem
              altitude
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
  }
`;

export default createMutation<SlotInput, CreateSlotPayload>(MUTATION_CREATE_SLOT, {
  getPayload: (result) => result.createSlot,
  fieldErrorMap: {
    extraIds: 'extras',
    jumpTypeId: 'jumpType',
    ticketTypeId: 'ticketType',
  },
  validates: {
    jumpTypeId: [isRequired('You must specify the type of jump')],
    ticketTypeId: [isRequired('You must select a ticket type')],
  },
});
