import * as React from 'react';
import { Text } from 'react-native';
import { Permission } from 'app/api/schema.d';
import { useManifestContext } from 'app/providers';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_OPERATOR from './__mocks__/QueryOperator.mock';
import MOCK_QUERY_ALLOWED_TICKET_TYPES from './__mocks__/QueryAllowedTicketTypes.mock';
import { MOCK_QUERY_ALLOWED_ACTIVITY_TYPES } from './__mocks__/QueryAllowedActivityTypes.mock';
import MOCK_QUERY_FEDERATIONS from './__mocks__/QueryFederations.mock';
import MOCK_QUERY_ROLES from './__mocks__/QueryRoles.mock';
import MOCK_QUERY_LICENSES from './__mocks__/QueryLicenses.mock';
import MOCK_QUERY_LOADS from './__mocks__/QueryLoads.mock';
import MOCK_QUERY_VEHICLES from './__mocks__/QueryVehicle.mock';
import MOCK_QUERY_MEMBERSHIPS from './__mocks__/QueryMemberships.mock';
import mockSubscriptionLoadCreated from './__mocks__/SubscriptionLoadCreated.mock';
import ManifestScreen from '../../screens/authenticated/manifest/manifest/ManifestScreen';
import { hostsWhere } from 'app/test-utils/hosts';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

// The group dialog is replaced by a host that shows whether it is open: its own content is not under test here
jest.mock('../../forms/manifest_group', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View: MockView } = require('react-native');
  return {
    __esModule: true,
    default: (props: { open?: boolean }) => (
      <MockView testID="mock-manifest-group-dialog" data-open={!!props.open} />
    ),
  };
});

// These tests describe the *expected* behaviour of known client bugs (see the backend repo's
// docs/reference/BUGS.md). A bug's test is skipped until it is fixed; unskip it in the fixing PR.

function boardMocks(loads = MOCK_QUERY_LOADS()) {
  return [
    MOCK_QUERY_OPERATOR(),
    MOCK_QUERY_ALLOWED_TICKET_TYPES(),
    MOCK_QUERY_ALLOWED_ACTIVITY_TYPES(),
    MOCK_QUERY_FEDERATIONS(),
    MOCK_QUERY_ROLES(),
    MOCK_QUERY_LICENSES(),
    loads,
    MOCK_QUERY_VEHICLES(),
    MOCK_QUERY_MEMBERSHIPS({ permissions: [Permission.ActAsGca] }),
    MOCK_QUERY_MEMBERSHIPS({ permissions: [Permission.ActAsPilot] }),
    mockSubscriptionLoadCreated(),
  ];
}

describe('known manifest bugs', () => {
  it('BUG-065: pull-to-refresh on the manifest board refetches the loads', async () => {
    const first = MOCK_QUERY_LOADS();
    const loadsRequests = jest.fn(() => first.result as never);
    const second = MOCK_QUERY_LOADS();
    const loadsRefetch = jest.fn(() => second.result as never);

    const screen = await render(<ManifestScreen />, {
      session: authenticatedSession,
      permissions: [Permission.ReadLoad],
      graphql: boardMocks({ ...first, result: loadsRequests } as never).concat([
        { ...second, result: loadsRefetch } as never,
      ]),
    });

    await waitFor(() => expect(screen.queryAllByTestId('load-card').length).toBe(2), {
      timeout: 10000,
    });
    // The scroll view of the board holds the refresh control as a prop
    hostsWhere(
      screen.container,
      (node) => !!node.props.refreshControl
    )[0].props.refreshControl.props.onRefresh();

    await waitFor(() => expect(loadsRefetch).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  it('BUG-066: the manifest group sheet is mounted on the manifest board', async () => {
    // Every "Manifest group" action on the board opens the sheet through the manifest context
    function OpenGroupSheet() {
      const { manifest, dialogs } = useManifestContext();
      return (
        <Text
          onPress={() =>
            manifest.loads[0] && dialogs.manifestGroup.open({ load: manifest.loads[0] as never })
          }
        >
          open group sheet
        </Text>
      );
    }
    const screen = await render(
      <>
        <ManifestScreen />
        <OpenGroupSheet />
      </>,
      {
        session: authenticatedSession,
        permissions: [Permission.ReadLoad, Permission.CreateUserSlot],
        graphql: boardMocks(),
      }
    );
    await waitFor(() => expect(screen.queryAllByTestId('load-card').length).toBe(2), {
      timeout: 10000,
    });

    await fireEvent.press(screen.getByText('open group sheet'));

    await waitFor(() => {
      const sheets = hostsWhere(
        screen.container,
        (node) => node.props.testID === 'mock-manifest-group-dialog'
      );
      expect(sheets.some((sheet) => sheet.props['data-open'] === true)).toBe(true);
    });
  });
});
