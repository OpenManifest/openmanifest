import gql from 'graphql-tag';
import { createMutation } from '../createMutation';
import { RigInput, UpdateRigPayload } from '../schema';

const MUTATION_UPDATE_RIG = gql`
  mutation UpdateRig(
    $id: Int!
    $name: String
    $make: String
    $model: String
    $serial: String
    $rigType: String
    $canopySize: Int
    $packingCard: String
    $repackExpiresAt: Int
    $userId: Int
    $dropzoneId: Int
  ) {
    updateRig(
      input: {
        id: $id
        attributes: {
          name: $name
          make: $make
          packingCard: $packingCard
          model: $model
          serial: $serial
          repackExpiresAt: $repackExpiresAt
          dropzoneId: $dropzoneId
          userId: $userId
          canopySize: $canopySize
          rigType: $rigType
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      rig {
        id
        name
        make
        model
        serial
        canopySize
        repackExpiresAt
        packValue
        maintainedAt
        rigType
        packingCard

        user {
          id
          rigs {
            id
            name
            make
            model
            serial
            canopySize
            repackExpiresAt
            packValue
            maintainedAt
          }
        }
      }
    }
  }
`;

export default createMutation<{ id: number } & RigInput, UpdateRigPayload>(MUTATION_UPDATE_RIG, {
  getPayload: (result) => result.updateRig,
  fieldErrorMap: {},
});