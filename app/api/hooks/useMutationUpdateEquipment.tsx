import { createMutation } from '../createMutation';
import { EquipmentInput, UpdateEquipmentPayload } from '../schema.d';
import { UpdateEquipmentDocument } from '../reflection';

export default createMutation<{ id: number } & EquipmentInput, UpdateEquipmentPayload>(
  UpdateEquipmentDocument,
  {
    getPayload: (result) => result.updateEquipment,
    fieldErrorMap: {},
  }
);
