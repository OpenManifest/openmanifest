import gql from "graphql-tag";
import { createMutation, isRequired } from "../createMutation";
import { GrantPermissionPayload } from "../schema";


export const MUTATION_GRANT_PERMISSION = gql`
mutation GrantPermission(
  $dropzoneUserId: Int!,
  $permissionName: Permission!,
){
  grantPermission(input: { id: $dropzoneUserId, permission: $permissionName }) {
    dropzoneUser {
      id
      permissions
    }
    fieldErrors {
      field
      message
    }
    errors
  }
}
`;


export default createMutation<{
  dropzoneUserId: number,
  permissionName: string,
}, GrantPermissionPayload>(
  MUTATION_GRANT_PERMISSION, {
    getPayload: (result) => result.grantPermission,
    validates: {
      permissionName: [
        isRequired("Permission name is required")
      ]
    }
  }
)