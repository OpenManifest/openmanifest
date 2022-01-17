import { createMutation, isRequired } from '../createMutation';
import { GrantPermissionMutation, GrantPermissionMutationVariables } from '../operations';
import { GrantPermissionDocument } from '../reflection';

export default createMutation<
  GrantPermissionMutationVariables,
  Required<GrantPermissionMutation>['grantPermission']
>(GrantPermissionDocument, {
  getPayload: (result) => result.grantPermission,
  validates: {
    permissionName: [isRequired('Permission name is required')],
  },
});
