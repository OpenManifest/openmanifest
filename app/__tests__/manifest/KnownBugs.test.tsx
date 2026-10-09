import * as React from 'react';
import { RefreshControl, Text } from 'react-native';
import { Permission } from 'app/api/schema.d';
import { useManifestContext } from 'app/providers';
import { CreateLoadDocument } from 'app/api/reflection';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_DROPZONE from './__mocks__/QueryDropzone.mock';
import MOCK_QUERY_ALLOWED_TICKET_TYPES from './__mocks__/QueryAllowedTicketTypes.mock';
import { MOCK_QUERY_ALLOWED_JUMP_TYPES } from './__mocks__/QueryAllowedJumpTypes.mock';
import MOCK_QUERY_FEDERATIONS from './__mocks__/QueryFederations.mock';
import MOCK_QUERY_ROLES from './__mocks__/QueryRoles.mock';
import MOCK_QUERY_LICENSES from './__mocks__/QueryLicenses.mock';
import MOCK_QUERY_LOADS from './__mocks__/QueryLoads.mock';
import MOCK_QUERY_PLANES from './__mocks__/QueryPlane.mock';
import MOCK_QUERY_DROPZONE_USERS from './__mocks__/QueryDropzoneUsers.mock';
import mockSubscriptionLoadCreated from './__mocks__/SubscriptionLoadCreated.mock';
import ManifestScreen from '../../screens/authenticated/dropzone/manifest/ManifestScreen';
import ManifestGroupDialog from '../../forms/manifest_group';
import LoadDialog from '../../forms/load/Dialog';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

// These tests describe the *expected* behaviour of known client bugs (see the backend repo's
// docs/reference/BUGS.md). They are skipped until the bug is fixed; unskip them in the fixing PR.

function boardMocks(loads = MOCK_QUERY_LOADS()) {
  return [
    MOCK_QUERY_DROPZONE(),
    MOCK_QUERY_ALLOWED_TICKET_TYPES(),
    MOCK_QUERY_ALLOWED_JUMP_TYPES(),
    MOCK_QUERY_FEDERATIONS(),
    MOCK_QUERY_ROLES(),
    MOCK_QUERY_LICENSES(),
    loads,
    MOCK_QUERY_PLANES(),
    MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsGca] }),
    MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsPilot] }),
    mockSubscriptionLoadCreated(),
  ];
}

describe('known manifest bugs', () => {
  it.skip('BUG-065: pull-to-refresh on the manifest board refetches the loads', async () => {
    const first = MOCK_QUERY_LOADS();
    const loadsRequests = jest.fn(() => first.result as never);
    const second = MOCK_QUERY_LOADS();
    const loadsRefetch = jest.fn(() => second.result as never);

    const screen = render(<ManifestScreen />, {
      session: authenticatedSession,
      permissions: [Permission.ReadLoad],
      graphql: boardMocks({ ...first, result: loadsRequests } as never).concat([
        { ...second, result: loadsRefetch } as never,
      ]),
    });

    await waitFor(() => expect(screen.queryAllByTestId('load-card').length).toBe(2), {
      timeout: 10000,
    });
    screen.UNSAFE_getByType(RefreshControl).props.onRefresh();

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
    const screen = render(
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

    fireEvent.press(screen.getByText('open group sheet'));

    await waitFor(() => {
      const sheets = screen.UNSAFE_queryAllByType(ManifestGroupDialog);
      expect(sheets.some((sheet) => sheet.props.open)).toBe(true);
    });
  });

  it.skip('BUG-067: staff without a valid membership can still create a load', async () => {
    const createLoadResult = jest.fn(() => ({
      data: {
        createLoad: {
          __typename: 'CreateLoadPayload',
          load: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));
    const dropzone = MOCK_QUERY_DROPZONE();
    const mockedDropzone = {
      ...dropzone,
      result: {
        data: {
          ...(dropzone.result as { data: Record<string, unknown> }).data,
          dropzone: {
            ...(dropzone.result as { data: { dropzone: Record<string, unknown> } }).data.dropzone,
            settings: {
              ...(dropzone.result as { data: { dropzone: { settings: object } } }).data.dropzone
                .settings,
              requireMembership: true,
            },
            currentUser: {
              ...(dropzone.result as { data: { dropzone: { currentUser: object } } }).data.dropzone
                .currentUser,
              hasMembership: false,
            },
          },
        },
      },
    };

    const screen = render(<LoadDialog open onClose={jest.fn()} onSuccess={jest.fn()} />, {
      session: authenticatedSession,
      graphql: [
        mockedDropzone as never,
        MOCK_QUERY_PLANES(),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsGca] }),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsPilot] }),
        // Any CreateLoad request is acceptable here, the point is that one is made
        {
          request: { query: CreateLoadDocument, operationName: 'CreateLoad', variables: {} },
          result: createLoadResult,
        },
      ],
    });

    screen.getAllByText('Create').forEach((button) => fireEvent.press(button));

    await waitFor(() => expect(createLoadResult).toHaveBeenCalled(), { timeout: 10000 });
  });
});
