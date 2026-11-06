import { createMutation } from '../createMutation';
import { MutationUpdateOperatorArgs } from '../schema.d';
import { UpdateOperatorDocument } from '../reflection';
import { UpdateOperatorMutation } from '../operations';

export default createMutation<
  { id: number } & MutationUpdateOperatorArgs['input']['attributes'],
  Required<UpdateOperatorMutation>['updateOperator']
>(UpdateOperatorDocument, {
  getPayload: (result) => result.updateOperator,
  fieldErrorMap: {},
});
