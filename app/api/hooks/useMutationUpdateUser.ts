import { createMutation, isEmail, isRequired, isNumeric, validates } from '../createMutation';
import { UpdateUserMutation, UpdateUserMutationVariables } from '../operations';
import { UpdateUserDocument } from '../reflection';

export default createMutation<
  UpdateUserMutationVariables,
  Required<UpdateUserMutation>['updateUser']
>(UpdateUserDocument, {
  getPayload: (result) => result.updateUser,
  validates: {
    email: [isRequired('Email is required'), isEmail('Not a valid email')],
    name: [isRequired('Name is required')],
    exitWeight: [
      isRequired('Exit weight is required'),
      isNumeric('Exit weight must be a valid number'),
      validates('Exit weight seems too low?', ({ exitWeight }) => {
        return Number(exitWeight) > 30;
      }),
    ],
  },
});
