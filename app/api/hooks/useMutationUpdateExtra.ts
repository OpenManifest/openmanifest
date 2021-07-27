import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { ExtraInput, UpdateExtraPayload } from '../schema';

const MUTATION_UPDATE_EXTRA = gql`
  mutation UpdateExtra(
    $id: Int!
    $name: String
    $ticketTypeIds: [Int!]
    $cost: Float
    $dropzoneId: Int
  ) {
    updateExtra(
      input: {
        id: $id
        attributes: {
          name: $name
          ticketTypeIds: $ticketTypeIds
          cost: $cost
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
    cost

    ticketTypes {
      id
      name
      cost
      altitude
      allowManifestingSelf
    }
  }
`;

export default createMutation<{ id: number } & ExtraInput, UpdateExtraPayload>(
  MUTATION_UPDATE_EXTRA,
  {
    getPayload: (result) => result.updateExtra,
    fieldErrorMap: {
      id: 'original',
      ticketTypeIds: 'ticketTypes',
    },
  }
);
