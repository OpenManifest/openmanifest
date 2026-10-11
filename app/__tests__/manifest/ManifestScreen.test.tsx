import * as React from 'react';
import { Settings } from 'luxon';
import { Permission } from 'app/api/schema.d';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { render, waitFor } from '../../__mocks__/render';
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
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

import ManifestScreen from '../../screens/authenticated/dropzone/manifest/ManifestScreen';

describe('<ManifestScreen />', () => {
  it('should show LoadCards for every load', async () => {
    const screen = render(<ManifestScreen />, {
      graphql: [
        MOCK_QUERY_DROPZONE(),
        MOCK_QUERY_ALLOWED_TICKET_TYPES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
        MOCK_QUERY_FEDERATIONS(),
        MOCK_QUERY_ROLES(),
        MOCK_QUERY_LICENSES(),
        MOCK_QUERY_LOADS(),
        MOCK_QUERY_PLANES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsGca] }),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsPilot] }),
        mockSubscriptionLoadCreated(),
      ],
      permissions: [Permission.ReadLoad, Permission.UpdateSlot],
      session: authenticatedSession,
    });

    await waitFor(
      async () => {
        const loads = screen.queryAllByTestId('load-card');

        expect(loads.length).toBe(2);
      },
      { timeout: 10000 }
    );
  });

  it('should show an empty message when no loads are available', async () => {
    const screen = render(<ManifestScreen />, {
      graphql: [
        MOCK_QUERY_DROPZONE(),
        MOCK_QUERY_ALLOWED_TICKET_TYPES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
        MOCK_QUERY_FEDERATIONS(),
        MOCK_QUERY_ROLES(),
        MOCK_QUERY_LICENSES(),
        set(cloneDeep(MOCK_QUERY_LOADS()), 'result.data.loads.edges', []),
        MOCK_QUERY_PLANES(),
        MOCK_QUERY_ALLOWED_JUMP_TYPES(),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsGca] }),
        MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsPilot] }),
        mockSubscriptionLoadCreated(),
      ],
      permissions: [Permission.ReadLoad, Permission.UpdateSlot],
      session: authenticatedSession,
    });

    await waitFor(
      () => {
        const loads = screen.queryAllByTestId('load-card');
        const text = screen.queryByText(/No loads so far today/);

        expect(loads.length).toBe(0);
        expect(text).toBeTruthy();
      },
      { timeout: 10000 }
    );
  });

  describe('the day of a Brisbane dropzone, seen from a device in UTC (BUG-068)', () => {
    const originalNow = Settings.now;
    const originalZone = Settings.defaultZone;
    afterEach(() => {
      Settings.now = originalNow;
      Settings.defaultZone = originalZone;
    });

    const renderBoard = (date: string) =>
      render(<ManifestScreen />, {
        graphql: [
          MOCK_QUERY_DROPZONE(),
          MOCK_QUERY_ALLOWED_TICKET_TYPES(),
          MOCK_QUERY_ALLOWED_JUMP_TYPES(),
          MOCK_QUERY_FEDERATIONS(),
          MOCK_QUERY_ROLES(),
          MOCK_QUERY_LICENSES(),
          MOCK_QUERY_LOADS({ date }),
          MOCK_QUERY_PLANES(),
          MOCK_QUERY_ALLOWED_JUMP_TYPES(),
          MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsGca] }),
          MOCK_QUERY_DROPZONE_USERS({ permissions: [Permission.ActAsPilot] }),
          mockSubscriptionLoadCreated(),
        ],
        permissions: [Permission.ReadLoad, Permission.UpdateSlot],
        session: authenticatedSession,
      });

    it("shows the loads of the dropzone's day, not the device's", async () => {
      // 23:00 UTC on 8 October: still the 8th on the device, already 09:00 on the 9th in Brisbane
      Settings.defaultZone = 'UTC';
      Settings.now = () => new Date('2026-10-08T23:00:00Z').valueOf();

      const screen = renderBoard('2026-10-09');

      await waitFor(() => expect(screen.queryAllByTestId('load-card').length).toBe(2), {
        timeout: 10000,
      });
    });
  });
});
