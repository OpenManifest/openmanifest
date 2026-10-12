import * as React from 'react';
import { Permission } from 'app/api/schema.d';
import { CreateLoadDocument } from 'app/api/reflection';
import { fireEvent, render, waitFor } from '../../__mocks__/render';
import MOCK_QUERY_VEHICLES from './__mocks__/QueryVehicle.mock';
import MOCK_QUERY_MEMBERSHIPS from './__mocks__/QueryMemberships.mock';
import MOCK_QUERY_OPERATOR from './__mocks__/QueryOperator.mock';
import LoadDialog from '../../forms/load/Dialog';
import { NotificationContext } from 'app/providers/notifications/context';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

const membership = (id: string, name: string) => ({
  __typename: 'Membership',
  id,
  walletId: id,
  expiresAt: null,
  hasCredits: true,
  hasMembership: true,
  hasLicense: true,
  hasBodyMassKg: true,
  role: null,
  license: null,
  user: {
    __typename: 'User',
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

// Builds the mock without touching the shared fixture (the helper merges overrides in place).
function usersWithPermission(permission: Permission, user: ReturnType<typeof membership>) {
  const mock = MOCK_QUERY_MEMBERSHIPS({ permissions: [permission] });
  return {
    ...mock,
    result: {
      data: {
        __typename: 'Query',
        memberships: {
          __typename: 'MembershipConnection',
          edges: [{ __typename: 'MembershipEdge', node: user }],
        },
      },
    },
  };
}

describe('<LoadDialog />', () => {
  it('sends the selected plane, pilot and GCA to CreateLoad', async () => {
    const mutationResult = jest.fn(() => ({
      data: {
        createLoad: {
          __typename: 'CreateLoadPayload',
          load: null,
          errors: null,
          fieldErrors: null,
        },
      },
    }));

    const screen = render(<LoadDialog open onClose={jest.fn()} onSuccess={jest.fn()} />, {
      session: authenticatedSession,
      graphql: [
        MOCK_QUERY_VEHICLES(),
        usersWithPermission(Permission.ActAsGca, membership('31', 'Gina GCA')),
        usersWithPermission(Permission.ActAsPilot, membership('32', 'Pete Pilot')),
        {
          request: {
            query: CreateLoadDocument,
            operationName: 'CreateLoad',
            variables: {
              gca: '31',
              pilot: '32',
              vehicle: '1',
              maxSlots: 10,
              state: 'open',
              name: null,
            },
          },
          result: mutationResult,
        },
      ],
    });

    // Vehicle, GCA and pilot are auto-selected once their queries resolve, and the vehicle sets max slots
    await waitFor(() => expect(screen.getAllByText('Gina GCA').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByText('Pete Pilot').length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await waitFor(() => expect(screen.getAllByText('Beaver').length).toBeGreaterThan(0), {
      timeout: 10000,
    });

    // ManifestContextProvider mounts its own (closed) copy of this dialog, which is never filled in,
    // so pressing every "Create" button only submits ours.
    screen.getAllByText('Create').forEach((button) => fireEvent.press(button));

    await waitFor(() => expect(mutationResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
  });

  // BUG-067: creating a load used to run the staff member's own jumper prerequisites (membership, licence, rig
  // inspection, reserve), so manifest staff without a valid membership could not create loads
  describe('as staff without a valid membership of their own', () => {
    const operator = MOCK_QUERY_OPERATOR();
    const data = (operator.result as { data: { operator: Record<string, any> } }).data;
    const withoutMembership = {
      ...operator,
      result: {
        data: {
          ...data,
          operator: {
            ...data.operator,
            settings: { ...data.operator.settings, requireMembership: true },
            currentUser: { ...data.operator.currentUser, hasMembership: false },
          },
        },
      },
    };

    function renderDialog(
      createLoadResult: jest.Mock,
      notifications = { success: jest.fn(), error: jest.fn(), info: jest.fn() }
    ) {
      const screen = render(
        <NotificationContext.Provider value={notifications}>
          <LoadDialog open onClose={jest.fn()} onSuccess={jest.fn()} />
        </NotificationContext.Provider>,
        {
          session: authenticatedSession,
          graphql: [
            withoutMembership as never,
            MOCK_QUERY_VEHICLES(),
            usersWithPermission(Permission.ActAsGca, membership('31', 'Gina GCA')),
            usersWithPermission(Permission.ActAsPilot, membership('32', 'Pete Pilot')),
            {
              request: {
                query: CreateLoadDocument,
                operationName: 'CreateLoad',
                variables: {
                  gca: '31',
                  pilot: '32',
                  vehicle: '1',
                  maxSlots: 10,
                  state: 'open',
                  name: null,
                },
              },
              result: createLoadResult,
            },
          ],
        }
      );
      return screen;
    }

    async function submit(screen: ReturnType<typeof renderDialog>) {
      await waitFor(() => expect(screen.getAllByText('Pete Pilot').length).toBeGreaterThan(0), {
        timeout: 10000,
      });
      await waitFor(() => expect(screen.getAllByText('Gina GCA').length).toBeGreaterThan(0), {
        timeout: 10000,
      });
      await waitFor(() => expect(screen.getAllByText('Beaver').length).toBeGreaterThan(0), {
        timeout: 10000,
      });
      screen.getAllByText('Create').forEach((button) => fireEvent.press(button));
    }

    it('still creates the load', async () => {
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

      await submit(renderDialog(createLoadResult));

      await waitFor(() => expect(createLoadResult).toHaveBeenCalledTimes(1), { timeout: 10000 });
    });

    it('shows an error of the load as a whole, like a missing GCA', async () => {
      const notifications = { success: jest.fn(), error: jest.fn(), info: jest.fn() };
      const createLoadResult = jest.fn(() => ({
        data: {
          createLoad: {
            __typename: 'CreateLoadPayload',
            load: null,
            errors: ['Every load must have a GCA'],
            fieldErrors: null,
          },
        },
      }));

      await submit(renderDialog(createLoadResult, notifications));

      await waitFor(
        () => expect(notifications.error).toHaveBeenCalledWith('Every load must have a GCA'),
        { timeout: 10000 }
      );
    });
  });
});
