import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { MutationUpdateTicketTypeArgs, UpdateTicketPayload } from '../schema';

const MUTATION_UPDATE_TICKET_TYPE = gql`
  mutation UpdateTicketType(
    $id: Int!
    $name: String
    $cost: Float
    $altitude: Int
    $allowManifestingSelf: Boolean
    $isTandem: Boolean
  ) {
    updateTicketType(
      input: {
        id: $id
        attributes: {
          name: $name
          cost: $cost
          altitude: $altitude
          allowManifestingSelf: $allowManifestingSelf
          isTandem: $isTandem
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
  { id: number } & MutationUpdateTicketTypeArgs['input']['attributes'],
  UpdateTicketPayload
>(MUTATION_UPDATE_TICKET_TYPE, {
  getPayload: (result) => result.updateTicketType,
  fieldErrorMap: {},
});
