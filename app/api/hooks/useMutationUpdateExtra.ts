import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { ExtraInput, UpdateExtraPayload } from '../schema.d';

const MUTATION_UPDATE_EXTRA = gql`
  mutation UpdateExtra(
    $id: Int!
    $name: String
    $ticketTypeIds: [Int!]
    $costCents: Int
    $operatorId: Int
  ) {
    updateExtra(
      input: {
        id: $id
        attributes: {
          name: $name
          ticketTypeIds: $ticketTypeIds
          costCents: $costCents
          operatorId: $operatorId
        }
      }
    ) {
      extra {
        ...extra

        operator {
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
