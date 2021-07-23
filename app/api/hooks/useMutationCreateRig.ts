import gql from "graphql-tag";
import { createMutation } from "../createMutation";
import { MutationCreateRigArgs, CreateRigPayload } from "../schema";


const MUTATION_CREATE_RIG = gql`
  mutation CreateRig(
    $make: String,
    $model: String,
    $serial: String,
    $rigType: String,
    $canopySize: Int,
    $repackExpiresAt: Int
    $userId: Int
    $dropzoneId: Int
  ) {
    createRig(
      input: {
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


export default createMutation<MutationCreateRigArgs["input"]["attributes"], CreateRigPayload>(
  MUTATION_CREATE_RIG, {
    getPayload: (result) => result.createRig,
    fieldErrorMap: {
    },
  }
);