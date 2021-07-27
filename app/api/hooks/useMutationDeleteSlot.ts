import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { DeleteSlotInput, DeleteSlotPayload } from '../schema';

const MUTATION_DELETE_SLOT = gql`
  mutation DeleteSlot($id: Int!) {
    deleteSlot(input: { id: $id }) {
      slot {
        id

        dropzoneUser {
          id
          user {
            id
            name
          }
        }
        load {
          id
          availableSlots
          isOpen
          weight
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
  }
`;

export default createMutation<DeleteSlotInput, DeleteSlotPayload>(MUTATION_DELETE_SLOT, {
  getPayload: (result) => result.deleteSlot,
});
