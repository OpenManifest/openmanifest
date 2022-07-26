import { createMutation } from '../createMutation';
import { LoadInput, UpdateLoadPayload } from '../schema';
import { UpdateLoadDocument } from '../reflection';

export default createMutation<{ id: number } & LoadInput, UpdateLoadPayload>(UpdateLoadDocument, {
  getPayload: (result) => result.updateLoad,
});
