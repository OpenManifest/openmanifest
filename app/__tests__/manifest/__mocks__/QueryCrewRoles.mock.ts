import { CrewRolesQuery, CrewRolesQueryVariables } from '../../../api/operations';
import { CrewRolesDocument } from '../../../api/reflection';
import { CrewRoleScope } from '../../../api/schema.d';
import createMockedQuery from './createMockedQuery.mock';

export const PILOT_ROLE = {
  __typename: 'CrewRole' as const,
  id: '1',
  key: 'pilot',
  name: 'Pilot',
  scope: CrewRoleScope.Vehicle,
  required: true,
  occupiesSlot: false,
  permission: 'actAsPilot',
  vehicleKinds: [],
  position: 0,
};

export const GCA_ROLE = {
  ...PILOT_ROLE,
  id: '2',
  key: 'gca',
  name: 'GCA',
  scope: CrewRoleScope.Load,
  permission: 'actAsGCA',
  position: 1,
};

/** The crew roles of a dropzone: a pilot for each aircraft and a GCA for the load */
export default createMockedQuery<CrewRolesQueryVariables, CrewRolesQuery>(
  CrewRolesDocument,
  { operatorId: '1' },
  {
    __typename: 'Query',
    operator: { __typename: 'Operator', id: '1', crewRoles: [PILOT_ROLE, GCA_ROLE] },
  }
);
