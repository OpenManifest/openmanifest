import * as React from 'react';
import { Text } from 'react-native';
import { Permission } from 'app/api/schema.d';
import { currentUserDetailed } from 'app/__fixtures__/currentUser.fixture';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { useOperatorContext } from 'app/providers/operator/context';
import EquipmentTab from '../../screens/authenticated/user/profile/tabs/Equipment';
import { render } from '../../__mocks__/render';

jest.setTimeout(30000);

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), setOptions: jest.fn(), dispatch: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useIsFocused: () => true,
}));

/** Shows once the operator's permissions have loaded, so absence checks are not vacuous */
function LoadedProbe() {
  const {
    operator: { permissions, currentUser },
  } = useOperatorContext();
  return permissions && currentUser ? <Text testID="loaded">loaded</Text> : null;
}

const SELF = currentUserDetailed as never;
const OTHER_MEMBER = { ...currentUserDetailed, id: '999' } as never;

function renderTab(membership: never, permissions: Permission[]) {
  return render(
    <>
      <LoadedProbe />
      <EquipmentTab membership={membership} tabIndex={2} currentTabIndex={2} />
    </>,
    { session: authenticatedSession, permissions, graphql: [] }
  );
}

// UB.2: staff run a member's equipment from the office
describe('<EquipmentTab />', () => {
  it('offers staff with UpdateUser to add a rig to another member', async () => {
    const screen = renderTab(OTHER_MEMBER, [Permission.UpdateUser]);

    expect(await screen.findByTestId('profile-add-rig')).toBeTruthy();
    expect(screen.getByText('Primary')).toBeTruthy();
  });

  it('does not offer another member to add a rig for someone else', async () => {
    const screen = renderTab(OTHER_MEMBER, [Permission.CreateEquipment]);

    await screen.findByTestId('loaded');
    expect(screen.queryByTestId('profile-add-rig')).toBeNull();
  });

  it('lets members add a rig to their own profile', async () => {
    const screen = renderTab(SELF, [Permission.CreateEquipment]);

    expect(await screen.findByTestId('profile-add-rig')).toBeTruthy();
  });
});
