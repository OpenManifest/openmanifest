import gql from 'graphql-tag';
import { createMutation, isRequired } from '../createMutation';
import { RevokePermissionPayload } from '../schema';

export const MUTATION_REVOKE_PERMISSION = gql`
  mutation RevokePermission($dropzoneUserId: Int!, $permissionName: Permission!) {
    revokePermission(input: { id: $dropzoneUserId, permission: $permissionName }) {
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

export default createMutation<
  {
    dropzoneUserId: number;
    permissionName: string;
  },
  RevokePermissionPayload
>(MUTATION_REVOKE_PERMISSION, {
  getPayload: (result) => result.revokePermission,
  validates: {
    permissionName: [isRequired('Permission name is required')],
  },
});
