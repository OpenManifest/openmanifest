import gql from 'graphql-tag';
import { createMutation, isNumeric, isRequired } from '../createMutation';
import { MutationCreateTicketTypeArgs, CreateTicketPayload } from '../schema.d';

const MUTATION_CREATE_TICKET_TYPE = gql`
  mutation CreateTicketType(
    $name: String
    $costCents: Int
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
          costCents: $costCents
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
        costCents
        allowManifestingSelf
        extras {
          id
          name
          costCents
        }

        dropzone {
          id

          ticketTypes {
            id
            name
            altitude
            costCents
            allowManifestingSelf
            extras {
              id
              name
              costCents
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
