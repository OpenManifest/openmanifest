import gql from 'graphql-tag';
import { createMutation, isNumeric, isRequired } from '../createMutation';
import { CreateEquipmentPayload, RigInput } from '../schema.d';

export const MUTATION_CREATE_EQUIPMENT = gql`
  mutation CreateRig(
    $make: String
    $name: String
    $model: String
    $serial: String
    $rigType: String
    $canopySize: Int
    $repackExpiresAt: Int
    $userId: Int
    $operatorId: Int
  ) {
    createEquipment(
      input: {
        attributes: {
          name: $name
          make: $make
          model: $model
          serial: $serial
          repackExpiresAt: $repackExpiresAt
          operatorId: $operatorId
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

        owner {
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

export default createMutation<RigInput, CreateEquipmentPayload>(MUTATION_CREATE_EQUIPMENT, {
  getPayload: (result) => result.createEquipment,
  fieldErrorMap: {},
  validates: {
    make: [isRequired('is required')],
    model: [isRequired('is required')],
    serial: [isRequired('number is required')],
    canopySize: [
      isRequired('Canopy size is required'),
      isNumeric('Canopy size must be a valid number'),
    ],
    repackExpiresAt: [isRequired('You must set a reserve repack expiry date')],
  },
});
