import { createMutation } from '../createMutation';
import { CreateEquipmentPayload, EquipmentInput } from '../schema.d';
import { CreateEquipmentDocument } from '../reflection';

export default createMutation<EquipmentInput, CreateEquipmentPayload>(CreateEquipmentDocument, {
  getPayload: (result) => result.createEquipment,
  fieldErrorMap: {},
  validates: {},
});
