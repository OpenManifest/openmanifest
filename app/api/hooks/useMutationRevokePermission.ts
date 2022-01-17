import { createMutation, isRequired } from '../createMutation';
import { RevokePermissionMutation, RevokePermissionMutationVariables } from '../operations';
import { RevokePermissionDocument } from '../reflection';

export default createMutation<
  RevokePermissionMutationVariables,
  Required<RevokePermissionMutation>['revokePermission']
>(RevokePermissionDocument, {
  getPayload: (result) => result.revokePermission,
  validates: {
    permissionName: [isRequired('Permission name is required')],
  },
});
