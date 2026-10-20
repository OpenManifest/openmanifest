import * as React from 'react';
import { Text } from 'react-native';
import { act, fireEvent } from '@testing-library/react-native';
import { hostsWhere } from 'app/test-utils/hosts';
import { LoadUpdatedDocument } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import type { LoadDetailsFragment } from 'app/api/operations';
import { useManifestContext } from 'app/providers';
import { render, waitFor, within } from '../../__mocks__/render';
import MOCK_QUERY_LOAD from './__mocks__/QueryLoad.mock';
import LoadScreen from '../../screens/authenticated/manifest/load/LoadScreen';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const mockNavigation = Object.assign(jest.fn(), { setOptions: jest.fn() });
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: { loadId: '1' } }),
  useIsFocused: () => false,
}));

const loadUpdatedMock = {
  request: { query: LoadUpdatedDocument, variables: { id: '1' } },
  result: { data: { loadUpdated: { __typename: 'LoadUpdatedPayload', load: null } } },
};

// The dialogs are replaced by hosts that show whether they are open: their own content is not under test here
jest.mock('../../legacy/manifest_group', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: { open?: boolean }) => (
      <View testID="mock-manifest-group-dialog" data-open={!!props.open} />
    ),
  };
});
jest.mock('../../legacy/manifest_user/Dialog', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: { open?: boolean }) => (
      <View testID="mock-manifest-user-dialog" data-open={!!props.open} />
    ),
  };
});

const isOpen = (screen: Awaited<ReturnType<typeof render>>, testID: string) =>
  hostsWhere(screen.container, (node) => node.props.testID === testID).some(
    (node) => node.props['data-open'] === true
  );

const openDialogs = (screen: Awaited<ReturnType<typeof render>>) => ({
  group: isOpen(screen, 'mock-manifest-group-dialog'),
  user: isOpen(screen, 'mock-manifest-user-dialog'),
});

async function renderLoadScreen(permissions: Permission[]) {
  const mock = MOCK_QUERY_LOAD();
  const screen = await render(<LoadScreen />, {
    graphql: [mock, loadUpdatedMock],
    permissions,
    session: authenticatedSession,
  });
  await waitFor(() => expect(screen.getByText('Amy Hops')).toBeTruthy(), { timeout: 10000 });
  return screen;
}

/** The rows of the slots table are pressed through their handler: they sit under `pointerEvents="none"` */
const pressSlotRow = async (screen: Awaited<ReturnType<typeof render>>, text: string) => {
  const index = screen
    .getAllByTestId('slot-row')
    .findIndex((row) => within(row).queryAllByText(text).length > 0);
  expect(index).toBeGreaterThan(-1);
  await fireEvent.press(screen.getAllByTestId('slot-row')[index]);
};

describe('manifest dialogs in the manifest context', () => {
  it('opens the group sheet for a load, from anywhere that has the context', async () => {
    let open: ((load: Pick<LoadDetailsFragment, 'id'>) => void) | undefined;
    function Opener() {
      open = (load) => dialogs.manifestGroup.open({ load: load as LoadDetailsFragment });
      const { dialogs } = useManifestContext();
      return <Text>opener</Text>;
    }
    const screen = await render(<Opener />, {
      graphql: [],
      permissions: [Permission.CreateUserSlot],
      session: authenticatedSession,
    });

    expect(openDialogs(screen).group).toBe(false);
    await act(() => open?.({ id: '1' }));

    await waitFor(() => expect(openDialogs(screen).group).toBe(true));
  });

  describe('tapping a slot on the load screen', () => {
    it('lets staff with only updateUserSlot open someone else’s slot (BUG-079)', async () => {
      const screen = await renderLoadScreen([Permission.ReadLoad, Permission.UpdateUserSlot]);

      await pressSlotRow(screen, 'Amy Hops');

      await waitFor(() => expect(openDialogs(screen).user).toBe(true));
    });

    it('does not open someone else’s slot for a member who can only update their own', async () => {
      const screen = await renderLoadScreen([Permission.ReadLoad, Permission.UpdateSlot]);

      await pressSlotRow(screen, 'Amy Hops');

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });
      expect(openDialogs(screen)).toEqual({ group: false, user: false });
    });
  });

  it('opens the group sheet from the "available slot" row', async () => {
    const screen = await renderLoadScreen([
      Permission.ReadLoad,
      Permission.CreateUserSlot,
      Permission.UpdateUserSlot,
    ]);

    await pressSlotRow(screen, '- Available -');

    await waitFor(() => expect(openDialogs(screen).group).toBe(true));
  });
});
