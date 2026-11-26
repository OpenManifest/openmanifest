import * as React from 'react';
import { Text, View } from 'react-native';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import { SlotEligibilityDocument } from 'app/api/reflection';
import EligibilityMessages from 'app/components/EligibilityMessages';
import { render, waitFor, within } from '../../__mocks__/render';
import useManifestValidator from '../useManifestValidator';

jest.setTimeout(30000);

const result = (overrides: Record<string, unknown>) => ({
  __typename: 'EligibilityResult',
  code: 'credits',
  ok: true,
  status: 'PASS',
  message: null,
  problem: null,
  bypassed: false,
  expiresAt: null,
  amountCents: null,
  ...overrides,
});

function Probe(props: { membershipId?: string | null }) {
  const { membershipId = '7' } = props;
  const validation = useManifestValidator(
    { loadId: '1', membershipId, ticketTypeId: '3', bodyMassKg: 80 },
    10
  );
  return (
    <View testID="probe">
      <Text testID="can">{String(validation.canManifest)}</Text>
      <Text testID="blocking">{validation.blocking.map(({ code }) => code).join(',')}</Text>
      <EligibilityMessages failures={validation.failures} expiring={validation.expiring} />
    </View>
  );
}

const request = {
  query: SlotEligibilityDocument,
  variables: {
    loadId: '1',
    membershipId: '7',
    ticketTypeId: '3',
    bodyMassKg: 80,
  },
};

describe('useManifestValidator', () => {
  it('shows what the server says fails, and what may be let through', async () => {
    const screen = await render(<Probe />, {
      session: authenticatedSession,
      graphql: [
        {
          request,
          result: {
            data: {
              slotEligibility: [
                result({
                  code: 'credits',
                  ok: false,
                  status: 'FAIL',
                  message: 'Not enough credits',
                }),
                result({
                  code: 'membership',
                  ok: false,
                  status: 'FAIL',
                  message: 'Membership has expired',
                  bypassed: true,
                }),
                result({ code: 'equipment_inspection', status: 'EXPIRING' }),
              ],
            },
          },
        },
      ],
    });
    const probe = within(screen.getByTestId('probe'));

    await waitFor(() => expect(probe.getByTestId('eligibility-failure-credits')).toBeTruthy());
    expect(probe.getByText('Not enough credits')).toBeTruthy();
    expect(probe.getByTestId('eligibility-warning-membership')).toBeTruthy();
    expect(probe.getByTestId('eligibility-expiring-equipment_inspection')).toBeTruthy();
    expect(probe.getByTestId('blocking').props.children).toBe('credits');
    expect(probe.getByTestId('can').props.children).toBe('false');
  });

  it('allows a slot that passes every rule', async () => {
    const screen = await render(<Probe />, {
      session: authenticatedSession,
      graphql: [{ request, result: { data: { slotEligibility: [result({})] } } }],
    });
    const probe = within(screen.getByTestId('probe'));

    await waitFor(() => expect(probe.getByTestId('can').props.children).toBe('true'));
    expect(probe.queryByTestId('eligibility-messages')).toBeNull();
  });

  it('asks nothing until there is a member', async () => {
    const screen = await render(<Probe membershipId={null} />, {
      session: authenticatedSession,
      graphql: [],
    });

    expect(within(screen.getByTestId('probe')).getByTestId('can').props.children).toBe('true');
  });
});
