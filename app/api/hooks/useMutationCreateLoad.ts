import gql from 'graphql-tag';
import { createMutation, isNumeric, isRequired } from '../createMutation';
import { CreateLoadPayload, LoadInput } from '../schema';

const MUTATION_CREATE_LOAD = gql`
  mutation CreateLoad(
    $name: String
    $pilotId: Int
    $gcaId: Int
    $maxSlots: Int!
    $planeId: Int
    $isOpen: Boolean
  ) {
    createLoad(
      input: {
        attributes: {
          name: $name
          pilotId: $pilotId
          gcaId: $gcaId
          maxSlots: $maxSlots
          planeId: $planeId
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
      isRequired('lease specify amount of allowed jumpers'),
      isNumeric('Please enter a valid number'),
    ],
    planeId: [isRequired('What plane is flying this load?')],
    gcaId: [isRequired('You must have a GCA for this load')],
  },
  fieldErrorMap: {
    planeId: 'plane',
    gcaId: 'gca',
  },
});
