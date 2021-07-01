import gql from "graphql-tag";
import { createMutation } from "../createMutation";
import { MutationUpdateRigArgs, UpdateRigPayload } from "../schema";


const MUTATION_UPDATE_RIG = gql`
  mutation UpdateRig(
    $id: Int!
    $make: String,
    $model: String,
    $serial: String,
    $rigType: String,
    $canopySize: Int,
    $repackExpiresAt: Int
    $userId: Int
    $dropzoneId: Int
  ) {
    updateRig(
      input: {
        id: $id,
        attributes: {
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


export default createMutation<{ id: number } & MutationUpdateRigArgs["input"]["attributes"], UpdateRigPayload>(
  MUTATION_UPDATE_RIG, {
    getPayload: (result) => result.updateRig,
    fieldErrorMap: {
    },
  }
);