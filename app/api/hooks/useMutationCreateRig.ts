import gql from 'graphql-tag';
import { createMutation, isNumeric, isRequired } from '../createMutation';
import { CreateRigPayload, RigInput } from '../schema';

const MUTATION_CREATE_RIG = gql`
  mutation CreateRig(
    $make: String
    $name: String
    $model: String
    $serial: String
    $rigType: String
    $canopySize: Int
    $repackExpiresAt: Int
    $userId: Int
    $dropzoneId: Int
  ) {
    createRig(
      input: {
        attributes: {
          name: $name
          make: $make
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

export default createMutation<RigInput, CreateRigPayload>(MUTATION_CREATE_RIG, {
  getPayload: (result) => result.createRig,
  fieldErrorMap: {},
  validates: {
    make: [isRequired('Manufacturer is required')],
    model: [isRequired('Model is required')],
    serial: [isRequired('Serial number is required')],
    canopySize: [
      isRequired('Canopy size is required'),
      isNumeric('Canopy size must be a valid number'),
    ],
    repackExpiresAt: [isRequired('You must set a reserve repack expiry date')],
  },
});
