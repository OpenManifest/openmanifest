import { createMutation } from '../createMutation';
import { MutationUpdateDropzoneArgs } from '../schema';
import { UpdateDropzoneDocument } from '../reflection';
import { UpdateDropzoneMutation } from '../operations';

export default createMutation<
  { id: number } & MutationUpdateDropzoneArgs['input']['attributes'],
  Required<UpdateDropzoneMutation>['updateDropzone']
>(UpdateDropzoneDocument, {
  getPayload: (result) => result.updateDropzone,
  fieldErrorMap: {},
});
