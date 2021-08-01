import gql from 'graphql-tag';
import { createMutation, isNumeric, isRequired } from '../createMutation';
import { MutationCreateTicketTypeArgs, CreateTicketPayload } from '../schema';

const MUTATION_CREATE_TICKET_TYPE = gql`
  mutation CreateTicketType(
    $name: String
    $cost: Float
    $dropzoneId: Int!
    $altitude: Int
    $allowManifestingSelf: Boolean
    $isTandem: Boolean
    $extraIds: [Int!]
  ) {
    createTicketType(
      input: {
        attributes: {
          name: $name
          cost: $cost
          dropzoneId: $dropzoneId
          altitude: $altitude
          allowManifestingSelf: $allowManifestingSelf
          isTandem: $isTandem
          extraIds: $extraIds
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      ticketType {
        id
        name
        altitude
        cost
        allowManifestingSelf
        extras {
          id
          name
          cost
        }

        dropzone {
          id

          ticketTypes {
            id
            name
            altitude
            cost
            allowManifestingSelf
            extras {
              id
              name
              cost
            }
          }
        }
      }
    }
  }
`;

export default createMutation<
  MutationCreateTicketTypeArgs['input']['attributes'],
  CreateTicketPayload
>(MUTATION_CREATE_TICKET_TYPE, {
  getPayload: (result) => result.createTicketType,
  fieldErrorMap: {
    extraIds: 'extras',
  },
  validates: {
    name: [isRequired('Tickets must have names')],
    cost: [isRequired('Tickets must have a price')],
    altitude: [isRequired('Altitude must be specified'), isNumeric('Altitude must be a number')],
  },
});
