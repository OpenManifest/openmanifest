import gql from 'graphql-tag';
import { createMutation, isNumeric, isRequired } from '../createMutation';
import { CreateLoadPayload, LoadInput } from '../schema';

const MUTATION_CREATE_LOAD = gql`
  mutation CreateLoad(
    $name: String
    $pilot: Int
    $gca: Int
    $maxSlots: Int!
    $plane: Int
    $isOpen: Boolean
  ) {
    createLoad(
      input: {
        attributes: {
          name: $name
          pilot: $pilot
          gca: $gca
          maxSlots: $maxSlots
          plane: $plane
          isOpen: $isOpen
        }
      }
    ) {
      load {
        id
        name
        loadNumber
        occupiedSlots
        availableSlots
        maxSlots
        pilot {
          id
          user {
            id
            name
          }
        }
        gca {
          id
          user {
            id
            name
          }
        }
        maxSlots
        isOpen
      }
      fieldErrors {
        field
        message
      }
      errors
    }
  }
`;

export default createMutation<LoadInput, CreateLoadPayload>(MUTATION_CREATE_LOAD, {
  getPayload: (result) => result.createLoad,
  validates: {
    maxSlots: [
      isRequired('Please specify amount of allowed jumpers'),
      isNumeric('Please enter a valid number'),
    ],
    plane: [isRequired('What plane is flying this load?')],
    gca: [isRequired('You must have a GCA for this load')],
  },
});
