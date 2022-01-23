import { createMutation, isEmail, isNumeric, isRequired } from '../createMutation';
import { CreateGhostDocument } from '../reflection';
import { CreateGhostMutation, CreateGhostMutationVariables } from '../operations';

export default createMutation<
  CreateGhostMutationVariables,
  Required<CreateGhostMutation>['createGhost']
>(CreateGhostDocument, {
  getPayload: (result) => result.createGhost,
  validates: {
    exitWeight: [
      isRequired('Exit weight must be provided'),
      isNumeric('Please enter a valid number'),
    ],
    email: [
      isRequired('Please provide a valid email address'),
      isEmail('Please provide a valid email address'),
    ],
    name: [isRequired('Name is required')],

    roleId: [isRequired('You must select a role')],
  },
  fieldErrorMap: {
    licenseId: 'license',
    exitWeight: 'exit_weight',
    roleId: 'role',
  },
});
