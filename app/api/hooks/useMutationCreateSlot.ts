import { createMutation, isRequired } from '../createMutation';
import { SlotInput, CreateSlotPayload } from '../schema';
import { ManifestUserDocument } from '../reflection';

export default createMutation<SlotInput, CreateSlotPayload>(ManifestUserDocument, {
  getPayload: (result) => result.createSlot,
  validates: {
    jumpType: [isRequired('You must specify the type of jump')],
    ticketType: [isRequired('You must select a ticket type')],
  },
});
