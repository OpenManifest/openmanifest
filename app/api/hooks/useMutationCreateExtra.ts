import gql from 'graphql-tag';
import { createMutation, isNumeric, isRequired } from '../createMutation';
import { ExtraInput, CreateExtraPayload } from '../schema.d';

const MUTATION_CREATE_EXTRA = gql`
  mutation CreateExtra($name: String, $ticketTypeIds: [Int!], $costCents: Int, $dropzoneId: Int) {
    createExtra(
      input: {
        attributes: {
          name: $name
          ticketTypeIds: $ticketTypeIds
          costCents: $costCents
          dropzoneId: $dropzoneId
        }
      }
    ) {
      extra {
        ...extra

        dropzone {
          id
          extras {
            ...extra
          }
        }
      }
    }
  }

  fragment extra on Extra {
    id
    name
    costCents
    ticketTypes {
      id
      name
      costCents
      altitude
      allowManifestingSelf
    }
  }
`;

export default createMutation<ExtraInput, CreateExtraPayload>(MUTATION_CREATE_EXTRA, {
  getPayload: (result) => result.createExtra,
  fieldErrorMap: {
    ticketTypeIds: 'ticketTypes',
  },
  validates: {
    name: [isRequired('Tickets must have names')],
    cost: [isRequired('Tickets must have a price'), isNumeric('Price must be a number')],
  },
});
