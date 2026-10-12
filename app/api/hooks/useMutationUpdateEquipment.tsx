import { createMutation } from '../createMutation';
import { RigInput, UpdateEquipmentPayload } from '../schema.d';
import { UpdateEquipmentDocument } from '../reflection';

export default createMutation<{ id: number } & RigInput, UpdateEquipmentPayload>(
  UpdateEquipmentDocument,
  {
    getPayload: (result) => result.updateEquipment,
    fieldErrorMap: {},
  }
);
