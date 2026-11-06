import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { rigKind } from 'app/__fixtures__/equipmentKind.fixture';
import { mockProfileQuery, profile } from 'app/__fixtures__/profile.fixture';
import createMockedQuery from 'app/__tests__/manifest/__mocks__/createMockedQuery.mock';
import { EquipmentInspectionTemplateDocument } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import { render, waitFor } from '../../../__mocks__/render';
import InspectionScreen from '../InspectionScreen';

jest.setTimeout(30000);

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), setOptions: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { membershipId: '999', equipmentId: '1' } }),
  useIsFocused: () => true,
}));

const definition = JSON.stringify([
  { label: 'Reserve date', valueType: 'string', isRequired: true, value: '2026-10-01' },
  { label: 'Pin check', valueType: 'boolean', value: true },
]);
/** Another member whose rig "Primary" was inspected before: the form shows as it was filled in */
const OTHER = {
  ...profile,
  id: '999',
  walletId: '999',
  user: { ...profile.user, id: '777' },
  equipmentInspections: [
    {
      __typename: 'EquipmentInspection',
      id: '70',
      isOk: true,
      definition,
      inspectedBy: { ...profile, equipmentInspections: undefined, slots: undefined },
      equipment: (profile.user.equipment ?? [])[0],
    },
  ],
};
const templates = createMockedQuery(EquipmentInspectionTemplateDocument, { operatorId: '1' }, {
  operator: {
    __typename: 'Operator',
    id: '1',
    equipmentKinds: [
      {
        ...rigKind,
        inspectionFormTemplate: { ...rigKind.inspectionFormTemplate, definition },
      },
    ],
  },
} as never);

async function renderInspection(permissions: Permission[]) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const mock = mockProfileQuery({ id: '999' }, { membership: OTHER as never });
  const screen = await render(<InspectionScreen />, {
    session: authenticatedSession,
    permissions,
    graphql: [mock, mock, templates(), templates()] as never,
  });
  await waitFor(() => expect(screen.getByTestId('inspection')).toBeTruthy(), { timeout: 10000 });
  await waitFor(() => expect(screen.getAllByText('Reserve date').length).toBeGreaterThan(0));
  return screen;
}

describe('<InspectionScreen />', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows the item and its last inspection as it was filled in, for an inspector to save', async () => {
    const screen = await renderInspection([Permission.ActAsEquipmentInspector]);

    expect(screen.getByText('Primary')).toBeTruthy();
    expect(screen.getByText('Equipment Inspection')).toBeTruthy();
    expect(screen.getByText('Pin check')).toBeTruthy();
    expect(screen.getByTestId('inspection-save')).toBeTruthy();
    expect(screen.queryByTestId('inspection-read-only')).toBeNull();
  });

  it('lets everybody else read it, without saving', async () => {
    const screen = await renderInspection([]);

    expect(screen.getByTestId('inspection-read-only')).toBeTruthy();
    expect(screen.queryByTestId('inspection-save')).toBeNull();
  });
});
