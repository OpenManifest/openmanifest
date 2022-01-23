import { createMutation } from '../createMutation';
import { UpdateTicketTypeDocument } from '../reflection';
import { UpdateTicketTypeMutation, UpdateTicketTypeMutationVariables } from '../operations';

export default createMutation<
  UpdateTicketTypeMutationVariables,
  Required<UpdateTicketTypeMutation>['updateTicketType']
>(UpdateTicketTypeDocument, {
  getPayload: (result) => result.updateTicketType,
  fieldErrorMap: {
    id: 'original',
    extraIds: 'extras',
  },
});
