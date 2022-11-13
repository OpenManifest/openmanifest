import { createMutation } from '../createMutation';
import { RigInput, UpdateRigPayload } from '../schema.d';
import { UpdateRigDocument } from '../reflection';

export default createMutation<{ id: number } & RigInput, UpdateRigPayload>(UpdateRigDocument, {
  getPayload: (result) => result.updateRig,
  fieldErrorMap: {},
});
