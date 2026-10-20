import { currentUserDetailed } from 'app/__fixtures__/currentUser.fixture';
import { AvailableEquipmentQuery, AvailableEquipmentQueryVariables } from '../../../api/operations';
import { AvailableEquipmentDocument } from '../../../api/reflection';
import createMockedQuery from './createMockedQuery.mock';

export default createMockedQuery<AvailableEquipmentQueryVariables, AvailableEquipmentQuery>(
  AvailableEquipmentDocument,
  { membershipId: 1, kind: 'rig' },
  {
    availableEquipment: (currentUserDetailed.user.equipment ?? []).map((item) => ({
      ...item,
      owner: { ...item.owner, equipment: [] },
    })) as never,
  }
);
