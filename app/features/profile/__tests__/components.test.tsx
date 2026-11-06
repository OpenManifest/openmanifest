import * as React from 'react';
import { DateTime } from 'luxon';
import { fireEvent } from '@testing-library/react-native';
import { renderThemed } from 'app/ui/components/testing';
import { rigKind } from 'app/__fixtures__/equipmentKind.fixture';
import { currentUserDetailed } from 'app/__fixtures__/currentUser.fixture';
import { Permission } from 'app/api/schema.d';
import ReadyChecklist from 'app/features/today/ReadyChecklist';
import { rule } from 'app/__fixtures__/profile.fixture';
import CertificationsSection from '../CertificationsSection';
import EquipmentSection from '../EquipmentSection';
import FundsSection from '../FundsSection';
import LoadsSection from '../LoadsSection';
import MembershipSection from '../MembershipSection';

const rig = (currentUserDetailed.user.equipment ?? [])[0] as never;
const inspection = {
  __typename: 'EquipmentInspection',
  id: '70',
  isOk: true,
  definition: '[]',
  inspectedBy: { user: { name: 'Ian Inspector' } },
  equipment: { id: '1' },
} as never;

describe('<MembershipSection />', () => {
  it('shows the role and the expiry as a date in words, with its state', async () => {
    const expiresAt = DateTime.fromISO('2099-10-08T12:00:00Z').toSeconds();
    const { getByTestId, getByText } = await renderThemed(
      <MembershipSection
        roleName="fun_jumper"
        expiresAt={expiresAt}
        permissions={[Permission.ActAsPilot, Permission.ReadLoad]}
        timeZone="Australia/Brisbane"
      />
    );

    expect(getByTestId('profile-membership-role-value').props.children).toBe('Fun Jumper');
    expect(getByTestId('profile-membership-expires-value').props.children).toBe('8 Oct 2099');
    expect(getByText('Active')).toBeTruthy();
    expect(getByTestId('profile-membership-acting-value').props.children).toBe('Pilot');
  });

  it('says when a membership ran out, and when there is none', async () => {
    const expired = await renderThemed(
      <MembershipSection
        roleName="student"
        expiresAt={DateTime.now().minus({ days: 3 }).toSeconds()}
      />
    );
    expect(expired.getByText('Ran out')).toBeTruthy();
    expect(expired.getByText('Expired')).toBeTruthy();

    const none = await renderThemed(<MembershipSection roleName={null} expiresAt={null} />);
    expect(none.getByTestId('profile-membership-expires-value').props.children).toBe(
      'Not a member'
    );
    expect(none.getByTestId('profile-membership-role-value').props.children).toBe('No role');
    expect(none.queryByTestId('profile-membership-edit')).toBeNull();
  });
});

describe('<FundsSection />', () => {
  it('shows the credit, in the blocked colour when it is below zero, and only the actions given', async () => {
    const onAddCredit = jest.fn();
    const { getByTestId, queryByTestId } = await renderThemed(
      <FundsSection creditsCents={-1250} onAddCredit={onAddCredit} />
    );

    expect(getByTestId('profile-funds-amount').props.children).toBe('-$12.50');
    expect(queryByTestId('profile-funds-wallet')).toBeNull();
    await fireEvent.press(getByTestId('profile-funds-add'));
    expect(onAddCredit).toHaveBeenCalled();
  });
});

describe('<LoadsSection />', () => {
  it('says there are none yet and leads to the board', async () => {
    const onBoard = jest.fn();
    const { getByText, getByRole } = await renderThemed(
      <LoadsSection slots={[]} self onOpen={jest.fn()} onBoard={onBoard} />
    );

    expect(getByText('No loads yet')).toBeTruthy();
    expect(getByText('Book a place on a load from the board and it shows here.')).toBeTruthy();
    await fireEvent.press(getByRole('button', { name: 'Go to the board' }));
    expect(onBoard).toHaveBeenCalled();
  });

  it('offers older loads when there are more', async () => {
    const onMore = jest.fn();
    const slot = {
      id: '1',
      costCents: 4000,
      load: { id: '9', loadNumber: 3, loadDate: '2026-10-08', state: 'completed' },
      activityType: { id: '1', name: 'Flat' },
      ticketType: null,
    } as never;
    const { getByText, getByTestId } = await renderThemed(
      <LoadsSection slots={[slot]} hasMore onMore={onMore} onOpen={jest.fn()} />
    );

    expect(getByText('Load #3 · 8 Oct 2026')).toBeTruthy();
    expect(getByText('Flat · $40.00')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
    await fireEvent.press(getByTestId('profile-loads-more'));
    expect(onMore).toHaveBeenCalled();
  });
});

describe('<CertificationsSection />', () => {
  it('says when there is none, and offers the update only to those who may', async () => {
    const onUpdate = jest.fn();
    const { getByText, getByTestId } = await renderThemed(
      <CertificationsSection certifications={[]} onUpdate={onUpdate} />
    );

    expect(getByText('No certifications yet')).toBeTruthy();
    await fireEvent.press(getByTestId('profile-certifications-update'));
    expect(onUpdate).toHaveBeenCalled();

    const reader = await renderThemed(<CertificationsSection certifications={[]} />);
    expect(reader.queryByTestId('profile-certifications-update')).toBeNull();
  });

  it('marks an expired qualification', async () => {
    const certification = {
      id: '1',
      number: null,
      verifiedAt: null,
      certificationBody: { name: 'APF' },
      certificationLevel: { name: 'A' },
      qualifications: [
        {
          id: '2',
          name: 'Tandem instructor',
          number: null,
          expiresAt: '2020-01-31',
          current: true,
          qualification: { name: 'Tandem instructor' },
        },
      ],
    } as never;
    const { getByText } = await renderThemed(
      <CertificationsSection certifications={[certification]} currentId="1" />
    );

    expect(getByText('APF · A')).toBeTruthy();
    expect(getByText('Not verified · Counts here')).toBeTruthy();
    expect(getByText('Expired 31 Jan 2020')).toBeTruthy();
    expect(getByText('Expired')).toBeTruthy();
  });
});

describe('<EquipmentSection />', () => {
  it('shows an item with its attributes, service date and who inspected it', async () => {
    const onEdit = jest.fn();
    const onInspect = jest.fn();
    const { getByText, getByTestId } = await renderThemed(
      <EquipmentSection
        equipment={[rig]}
        inspections={[inspection]}
        kinds={[rigKind]}
        onEdit={onEdit}
        onInspect={onInspect}
        onViewCard={jest.fn()}
      />
    );

    expect(getByText('Primary')).toBeTruthy();
    expect(getByText('Rig · Vector V310 · 12345')).toBeTruthy();
    expect(getByText('Main canopy size')).toBeTruthy();
    expect(getByTestId('profile-equipment-1-inspection-value').props.children).toBe(
      'By Ian Inspector'
    );
    expect(getByText('Inspected')).toBeTruthy();
    await fireEvent.press(getByTestId('profile-equipment-1-edit'));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    await fireEvent.press(getByTestId('profile-equipment-1-inspect'));
    expect(onInspect).toHaveBeenCalled();
  });

  it('says an item is not inspected, and keeps editing from those who may not', async () => {
    const { getByText, queryByTestId } = await renderThemed(
      <EquipmentSection
        equipment={[rig]}
        inspections={[]}
        kinds={[rigKind]}
        onInspect={jest.fn()}
        onViewCard={jest.fn()}
      />
    );

    expect(getByText('Not inspected')).toBeTruthy();
    expect(queryByTestId('profile-equipment-1-edit')).toBeNull();
    expect(queryByTestId('profile-add-equipment')).toBeNull();
  });

  it('says there is none yet, with the add button for those who may', async () => {
    const { getByText, getByTestId } = await renderThemed(
      <EquipmentSection
        equipment={[]}
        inspections={[]}
        kinds={[rigKind]}
        onAdd={jest.fn()}
        onInspect={jest.fn()}
        onViewCard={jest.fn()}
      />
    );

    expect(getByText('No equipment yet')).toBeTruthy();
    expect(getByTestId('profile-add-equipment')).toBeTruthy();
  });
});

describe('<ReadyChecklist /> on a profile', () => {
  it('offers a fix only for the rules the viewer can fix, under the heading given', async () => {
    const { getByText, getByTestId, queryByTestId } = await renderThemed(
      <ReadyChecklist
        testID="profile-ready"
        title="Is Jo ready?"
        rules={[rule('credits', false, 'FAIL'), rule('membership', false, 'FAIL')]}
        canFix={(item) => item.code === 'credits'}
        onFix={jest.fn()}
      />
    );

    expect(getByText('Is Jo ready?')).toBeTruthy();
    expect(getByTestId('profile-ready-credits-fix')).toBeTruthy();
    expect(queryByTestId('profile-ready-membership-fix')).toBeNull();
  });
});
