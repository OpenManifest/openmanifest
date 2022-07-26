import { createMutation, isNumeric, isRequired } from '../createMutation';
import { CreateLoadPayload, LoadInput } from '../schema';
import { CreateLoadDocument } from '../reflection';

export default createMutation<LoadInput, CreateLoadPayload>(CreateLoadDocument, {
  getPayload: (result) => result.createLoad,
  validates: {
    maxSlots: [
      isRequired('Please specify amount of allowed jumpers'),
      isNumeric('Please enter a valid number'),
    ],
    plane: [isRequired('What plane is flying this load?')],
    gca: [isRequired('You must have a GCA for this load')],
  },
});
