import * as React from 'react';
import { View } from 'react-native';
import { CrewRolesDocument, MembershipsDocument } from 'app/api/reflection';
import { CrewRoleScope, LoadVehicleRole, Permission } from 'app/api/schema.d';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { scoped } from 'app/test-utils/hosts';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import LoadCrewChips from '../LoadCrewChips';

jest.setTimeout(30000);

const role = (id: string, key: string, name: string, scope: CrewRoleScope, extra = {}) => ({
  __typename: 'CrewRole' as const,
  id,
  key,
  name,
  scope,
  required: true,
  occupiesSlot: false,
  permission: 'actAsPilot',
  vehicleKinds: [] as string[],
  position: Number(id),
  ...extra,
});
const guide = role('1', 'guide', 'Guide', CrewRoleScope.Vehicle, { vehicleKinds: ['raft'] });
const ranger = role('2', 'ranger', 'Ranger', CrewRoleScope.Load, { permission: null });

const vehicle = (id: string, name: string, kind: string) => ({
  __typename: 'Vehicle' as const,
  id,
  name,
  kind,
  registration: name,
  capacity: 6,
  minCapacity: 1,
});
const loadVehicle = (
  id: string,
  v: ReturnType<typeof vehicle>,
  role_ = LoadVehicleRole.Carrying
) => ({
  __typename: 'LoadVehicle' as const,
  id,
  role: role_,
  position: Number(id),
  capacity: 6,
  slotsCount: 0,
  vehicle: v,
});

const member = (id: string, name: string) => ({
  __typename: 'Membership' as const,
  id,
  walletId: id,
  expiresAt: null,
  hasCredits: true,
  hasMembership: true,
  hasCertificationLevel: true,
  hasBodyMassKg: true,
  role: null,
  certificationLevel: null,
  user: {
    __typename: 'User' as const,
    id,
    name,
    nickname: null,
    phone: null,
    email: null,
    bodyMassKg: '80',
    moderationRole: null,
    image: null,
    apfNumber: null,
  },
});

const load = {
  vehicles: [
    loadVehicle('1', vehicle('1', 'Raft 1', 'raft')),
    loadVehicle('2', vehicle('2', 'Raft 2', 'raft')),
    loadVehicle('3', vehicle('3', 'Tender', 'chase'), LoadVehicleRole.Support),
  ],
  crew: [
    {
      __typename: 'LoadCrewAssignment',
      id: '1',
      crewRole: guide,
      membership: member('11', 'Gus'),
      loadVehicle: { __typename: 'LoadVehicle', id: '1' },
    },
    {
      __typename: 'LoadCrewAssignment',
      id: '2',
      crewRole: ranger,
      membership: member('13', 'Rae'),
      loadVehicle: null,
    },
  ],
} as never;

const mocks = [
  {
    request: { query: CrewRolesDocument, variables: { operatorId: '1' } },
    result: {
      data: {
        __typename: 'Query',
        operator: { __typename: 'Operator', id: '1', crewRoles: [guide, ranger] },
      },
    },
    maxUsageCount: 10,
  },
  // The ranger needs no permission: anybody of the operator may fill it
  {
    request: { query: MembershipsDocument, variables: { operatorId: '1' } },
    result: {
      data: {
        __typename: 'Query',
        memberships: {
          __typename: 'MembershipConnection',
          edges: [{ __typename: 'MembershipEdge', node: member('13', 'Rae') }],
        },
      },
    },
    maxUsageCount: 10,
  },
  {
    request: {
      query: MembershipsDocument,
      variables: { operatorId: '1', permissions: [Permission.ActAsPilot] },
    },
    result: {
      data: {
        __typename: 'Query',
        memberships: {
          __typename: 'MembershipConnection',
          edges: [member('11', 'Gus'), member('12', 'Gwen')].map((node) => ({
            __typename: 'MembershipEdge',
            node,
          })),
        },
      },
    },
    maxUsageCount: 10,
  },
];

describe('<LoadCrewChips />', () => {
  it('has a chip for the role of the load and one for each raft, none for the vehicle that supports', async () => {
    const screen = await render(
      <View testID="under-test">
        <LoadCrewChips load={load} onSelect={jest.fn()} />
      </View>,
      { session: authenticatedSession, permissions: [Permission.UpdateLoad], graphql: mocks }
    );
    const chips = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(chips.getByText('Rae')).toBeTruthy());
    expect(chips.getByText('Gus')).toBeTruthy();
    expect(chips.getByLabelText('Guide · Raft 2: No Guide · Raft 2')).toBeTruthy();
    expect(chips.queryByLabelText(/Tender/)).toBeNull();
  });

  it('puts the chosen member on the role of that raft', async () => {
    const onSelect = jest.fn();
    const screen = await render(
      <View testID="under-test">
        <LoadCrewChips load={load} onSelect={onSelect} />
      </View>,
      { session: authenticatedSession, permissions: [Permission.UpdateLoad], graphql: mocks }
    );
    const chips = scoped(screen.getByTestId('under-test'));
    await waitFor(() => expect(chips.getByLabelText(/Guide · Raft 2/)).toBeTruthy());

    await fireEvent.press(chips.getByLabelText(/Guide · Raft 2/));
    await fireEvent.press(await screen.findByRole('menuitem', { name: 'Gwen' }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' }),
      expect.objectContaining({ id: '12' }),
      '2'
    );
  });

  it('only shows the crew to someone who may not change the load', async () => {
    const screen = await render(
      <View testID="under-test">
        <LoadCrewChips load={load} onSelect={jest.fn()} />
      </View>,
      { session: authenticatedSession, permissions: [], graphql: mocks }
    );
    const chips = scoped(screen.getByTestId('under-test'));

    await waitFor(() => expect(chips.getByText('Gus')).toBeTruthy());
    expect(chips.getByText('No Guide · Raft 2')).toBeTruthy();
  });
});
