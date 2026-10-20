import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import MOCK_QUERY_LOADS from 'app/__tests__/manifest/__mocks__/QueryLoads.mock';
import createMockedQuery from 'app/__tests__/manifest/__mocks__/createMockedQuery.mock';
import { MemberPickerDocument, SlotEligibilityDocument } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import { makeLoad } from 'app/__fixtures__/board.fixture';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import MemberPicker from '../MemberPicker';
import MemberPickerRow from '../MemberPickerRow';
import DefaultsCard from '../DefaultsCard';
import { defaultsOf } from '../members';
import { renderThemed } from 'app/ui/components/testing';

jest.setTimeout(30000);

const rule = (code: string, status = 'PASS', extra: Record<string, unknown> = {}) => ({
  __typename: 'EligibilityResult',
  code,
  ok: status !== 'FAIL',
  status,
  message: null,
  problem: null,
  bypassed: false,
  expiresAt: null,
  amountCents: null,
  ...extra,
});

const lastSlot = {
  __typename: 'Slot',
  id: '90',
  lockVersion: 0,
  createdAt: '2026-10-01T00:00:00Z',
  bodyMassKg: 81,
  prepaid: false,
  guestSlots: [],
  wingLoading: null,
  groupNumber: 0,
  costCents: 2500,
  ticketType: { __typename: 'TicketType', id: 't1', name: 'Fun jump', costCents: 2500 },
  destination: null,
  loadVehicle: null,
  activityType: { __typename: 'ActivityType', id: 'a1', name: 'Freefly' },
  extras: [],
  equipment: [],
  membership: null,
  load: { __typename: 'Load', id: '5', loadDate: '2026-10-01' },
};

const member = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
  __typename: 'Membership',
  id,
  walletId: `w${id}`,
  expiresAt: null,
  hasCredits: true,
  hasMembership: true,
  hasCertificationLevel: true,
  role: null,
  certificationLevel: { __typename: 'CertificationLevel', id: 'c', name: 'License A' },
  user: {
    __typename: 'User',
    id: `u${id}`,
    name,
    nickname: null,
    phone: null,
    email: null,
    bodyMassKg: '80.0',
    dateOfBirth: null,
    moderationRole: null,
    image: null,
  },
  creditsCents: 10000,
  eligibility: { __typename: 'MembershipEligibility', ready: true, rules: [rule('credits')] },
  lastSlot: null,
  ...extra,
});

const READY = member('1', 'Ann Ready', { lastSlot });
const BLOCKED = member('2', 'Bo Blocked', {
  eligibility: {
    __typename: 'MembershipEligibility',
    ready: false,
    rules: [rule('membership', 'FAIL', { message: 'Membership has expired' })],
  },
});
const NEW = member('3', 'Cy New');

const picker = createMockedQuery(
  MemberPickerDocument,
  { operatorId: '1', loadId: '10', first: 50 },
  {
    memberships: {
      __typename: 'MembershipConnection',
      edges: [READY, BLOCKED, NEW].map((node) => ({
        __typename: 'MembershipEdge',
        cursor: node.id,
        node,
      })),
      pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
    },
  } as never
);

const slotEligibility = (failures: Record<string, unknown>[] = []) => ({
  request: {
    query: SlotEligibilityDocument,
    variables: {
      loadId: '10',
      membershipId: '1',
      ticketTypeId: 't1',
      activityTypeId: 'a1',
      extraIds: [],
      equipmentIds: [],
      bodyMassKg: 81,
    },
  },
  result: { data: { slotEligibility: [rule('capacity'), rule('credits'), ...failures] } },
});

const load = makeLoad({ id: '10', loadNumber: 3 });

async function renderPicker(onClose = jest.fn()) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const screen = await render(<MemberPicker load={load} open onClose={onClose} />, {
    session: authenticatedSession,
    permissions: [Permission.CreateUserSlot],
    graphql: [picker(), slotEligibility(), MOCK_QUERY_LOADS()],
  });
  return { screen, onClose };
}

describe('<MemberPicker />', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lists the members, the ones who can be added first, with the reason for the others', async () => {
    const { screen } = await renderPicker();

    await waitFor(() => expect(screen.getAllByTestId('picker-row')).toHaveLength(3), {
      timeout: 10000,
    });
    expect(
      screen.getAllByTestId('picker-row-select').map((row) => row.props.accessibilityLabel)
    ).toEqual(['Ann Ready', 'Cy New', 'Bo Blocked']);
    expect(screen.getByText('Membership has expired')).toBeTruthy();
    expect(screen.getByLabelText('Fix Bo Blocked')).toBeTruthy();
  });

  it('fills in the last slot when a member is picked, and adds them with it', async () => {
    const { screen } = await renderPicker();
    await waitFor(() => expect(screen.getByLabelText('Ann Ready')).toBeTruthy(), {
      timeout: 10000,
    });

    await fireEvent.press(screen.getByLabelText('Ann Ready'));

    await waitFor(() => expect(screen.getByTestId('picker-defaults-ticket')).toBeTruthy());
    expect(screen.getByText('Fun jump')).toBeTruthy();
    expect(screen.getByText('Freefly')).toBeTruthy();
    expect(screen.getByTestId('member-picker-credit').props.children).toMatch(
      /\$25\.00 comes off Ann Ready/
    );
    await waitFor(
      () =>
        expect(
          screen.getByTestId('member-picker-add').props.accessibilityState?.disabled
        ).toBeFalsy(),
      {
        timeout: 10000,
      }
    );
  });

  it('cannot add a member who has nothing to start from until they choose', async () => {
    const { screen } = await renderPicker();
    await waitFor(() => expect(screen.getByLabelText('Cy New')).toBeTruthy(), { timeout: 10000 });

    await fireEvent.press(screen.getByLabelText('Cy New'));

    await waitFor(() => expect(screen.getByTestId('picker-defaults-none')).toBeTruthy());
    expect(screen.getByTestId('member-picker-add').props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByTestId('picker-defaults-change')).toBeTruthy();
  });
});

describe('<MemberPickerRow /> and <DefaultsCard />', () => {
  it('says why a member is blocked and offers the fix', async () => {
    const onFix = jest.fn();
    const { getByText, getByLabelText } = await renderThemed(
      <MemberPickerRow member={BLOCKED as never} onFix={onFix} />
    );

    expect(getByText('Membership has expired')).toBeTruthy();
    await fireEvent.press(getByLabelText('Fix Bo Blocked'));
    expect(onFix).toHaveBeenCalledWith(BLOCKED);
  });

  it('shows what the slot will be, and what the server says about it', async () => {
    const validation = {
      loading: false,
      results: [],
      failures: [rule('equipment', 'FAIL', { message: 'No equipment in service', bypassed: true })],
      blocking: [],
      expiring: [],
      canManifest: true,
    } as never;
    const { getByText, getByTestId } = await renderThemed(
      <DefaultsCard
        member={READY as never}
        defaults={defaultsOf(READY as never)}
        validation={validation}
      />
    );

    expect(getByText('Fun jump')).toBeTruthy();
    expect(getByText('$25.00')).toBeTruthy();
    expect(getByTestId('picker-defaults-failure-equipment').props.children.join('')).toMatch(
      /No equipment in service/
    );
  });
});
