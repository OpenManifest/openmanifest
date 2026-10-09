import * as React from 'react';
import { Text } from 'react-native';
import { DataTable } from 'react-native-paper';
import { act } from '@testing-library/react-native';
import { LoadUpdatedDocument } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import type { LoadDetailsFragment } from 'app/api/operations';
import { useManifestContext } from 'app/providers';
import * as appRedux from '../../state';
import { render, waitFor, within } from '../../__mocks__/render';
import MOCK_QUERY_LOAD from './__mocks__/QueryLoad.mock';
import LoadScreen from '../../screens/authenticated/dropzone/load/LoadScreen';
import ManifestGroupDialog from '../../forms/manifest_group';
import ManifestUserDialog from '../../forms/manifest_user/Dialog';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => jest.fn(),
  useRoute: () => ({ params: { loadId: '1' } }),
  useIsFocused: () => false,
}));

const loadUpdatedMock = {
  request: { query: LoadUpdatedDocument, variables: { id: '1' } },
  result: { data: { loadUpdated: { __typename: 'LoadUpdatedPayload', load: null } } },
};

const authenticatedState = {
  ...appRedux.initialState,
  global: { ...appRedux.initialState.global, authenticated: true },
};

const openDialogs = (screen: ReturnType<typeof render>) => ({
  group: screen
    .UNSAFE_queryAllByType(ManifestGroupDialog)
    .some((dialog) => dialog.props.open === true),
  user: screen
    .UNSAFE_queryAllByType(ManifestUserDialog)
    .some((dialog) => dialog.props.open === true),
});

async function renderLoadScreen(permissions: Permission[]) {
  const mock = MOCK_QUERY_LOAD();
  const screen = render(<LoadScreen />, {
    graphql: [mock, loadUpdatedMock],
    permissions,
    initialState: authenticatedState,
    session: authenticatedSession,
  });
  await waitFor(() => expect(screen.getByText('Amy Hops')).toBeTruthy(), { timeout: 10000 });
  return screen;
}

/** The rows of the slots table are pressed through their handler: they sit under `pointerEvents="none"` */
const pressSlotRow = (screen: ReturnType<typeof render>, text: string) => {
  const index = screen
    .getAllByTestId('slot-row')
    .findIndex((row) => within(row).queryAllByText(text).length > 0);
  expect(index).toBeGreaterThan(-1);
  act(() => screen.UNSAFE_getAllByType(DataTable.Row)[index].props.onPress());
};

describe('manifest dialogs in the manifest context', () => {
  it('opens the group sheet for a load, from anywhere that has the context', async () => {
    let open: ((load: Pick<LoadDetailsFragment, 'id'>) => void) | undefined;
    function Opener() {
      open = (load) => dialogs.manifestGroup.open({ load: load as LoadDetailsFragment });
      const { dialogs } = useManifestContext();
      return <Text>opener</Text>;
    }
    const screen = render(<Opener />, {
      graphql: [],
      permissions: [Permission.CreateUserSlot],
      initialState: authenticatedState,
      session: authenticatedSession,
    });

    expect(openDialogs(screen).group).toBe(false);
    act(() => open?.({ id: '1' }));

    await waitFor(() => expect(openDialogs(screen).group).toBe(true));
  });

  describe('tapping a slot on the load screen', () => {
    it('lets staff with only updateUserSlot open someone else’s slot (BUG-079)', async () => {
      const screen = await renderLoadScreen([Permission.ReadLoad, Permission.UpdateUserSlot]);

      pressSlotRow(screen, 'Amy Hops');

      await waitFor(() => expect(openDialogs(screen).user).toBe(true));
    });

    it('does not open someone else’s slot for a member who can only update their own', async () => {
      const screen = await renderLoadScreen([Permission.ReadLoad, Permission.UpdateSlot]);

      pressSlotRow(screen, 'Amy Hops');

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

    pressSlotRow(screen, '- Available -');

    await waitFor(() => expect(openDialogs(screen).group).toBe(true));
  });
});
