import { DateTime } from 'luxon';
import { Permission } from 'app/api/schema.d';
import {
  abilitiesOf,
  actingOf,
  fixOf,
  inspectionOf,
  membershipStateOf,
  profileRules,
  qualificationState,
  slotsOf,
} from '../profile';

const NOW = DateTime.fromISO('2026-10-20T12:00:00Z');

describe('abilitiesOf', () => {
  it('lets a member edit their own details and equipment, and nothing of the office', () => {
    const own = abilitiesOf('5', '5', [Permission.CreateEquipment]);

    expect(own).toEqual({
      self: true,
      editDetails: true,
      editMembership: false,
      addCredit: false,
      readTransactions: false,
      manageEquipment: true,
      inspect: false,
      remove: false,
    });
  });

  it('gives a student their own details but not their equipment without createEquipment', () => {
    const student = abilitiesOf('6', '6', [Permission.ReadLoad, Permission.CreateSlot]);

    expect(student.self).toBe(true);
    expect(student.editDetails).toBe(true);
    expect(student.manageEquipment).toBe(false);
  });

  it('gives staff the office actions on another member by permission (UB.2: equipment with updateUser)', () => {
    const desk = abilitiesOf('1', '5', [
      Permission.UpdateUser,
      Permission.CreateUserTransaction,
      Permission.ReadUserTransactions,
      Permission.DeleteUser,
    ]);

    expect(desk).toMatchObject({
      self: false,
      editDetails: true,
      editMembership: true,
      addCredit: true,
      readTransactions: true,
      manageEquipment: true,
      remove: true,
    });
  });

  it('keeps another member out of someone else’s profile', () => {
    const other = abilitiesOf('7', '5', [Permission.CreateEquipment]);

    expect(other.editDetails).toBe(false);
    expect(other.manageEquipment).toBe(false);
    expect(other.remove).toBe(false);
  });

  it('never offers staff to remove themselves from here', () => {
    expect(abilitiesOf('1', '1', [Permission.DeleteUser]).remove).toBe(false);
  });
});

describe('fixOf', () => {
  const member = abilitiesOf('5', '5', [Permission.CreateEquipment]);
  const desk = abilitiesOf('1', '5', [Permission.UpdateUser, Permission.CreateUserTransaction]);

  it('sends a member to their wallet for credit, and staff to the credits sheet', () => {
    expect(fixOf('credits', member)).toBe('wallet');
    expect(fixOf('credits', desk)).toBe('credit');
  });

  it('has no fix for a member’s own membership: that is the manifest desk', () => {
    expect(fixOf('membership', member)).toBeNull();
    expect(fixOf('membership', desk)).toBe('membership');
  });

  it('fixes the certification and body mass with the details, the age with the guided form', () => {
    expect(fixOf('certification', member)).toBe('details');
    expect(fixOf('body_mass_missing', desk)).toBe('details');
    expect(fixOf('date_of_birth_missing', member)).toBe('wizard');
  });

  it('fixes equipment where it is managed or inspected, and nothing it does not know', () => {
    expect(fixOf('equipment_not_inspected', member)).toBe('equipment');
    expect(fixOf('equipment', abilitiesOf('7', '5', []))).toBeNull();
    expect(fixOf('payload', desk)).toBeNull();
  });
});

describe('profileRules', () => {
  it('leaves out the rules the operator does not ask for', () => {
    const rules = [
      { code: 'credits', status: 'PASS' },
      { code: 'age', status: 'NOT_REQUIRED' },
      { code: 'membership', status: 'FAIL' },
    ];

    expect(profileRules(rules).map(({ code }) => code)).toEqual(['credits', 'membership']);
  });
});

describe('slotsOf', () => {
  it('reads the loads of the connection and skips empty edges', () => {
    const slot = { id: '1' };

    expect(slotsOf({ slots: { edges: [{ node: slot }, null, { node: null }] } } as never)).toEqual([
      slot,
    ]);
    expect(slotsOf(null)).toEqual([]);
  });
});

describe('inspectionOf', () => {
  const inspection = (id: string, equipmentId: string, isOk: boolean) =>
    ({ id, isOk, equipment: { id: equipmentId } }) as never;

  it('is the last inspection of the item that passed it', () => {
    const inspections = [
      inspection('1', 'a', true),
      inspection('2', 'b', true),
      inspection('3', 'a', true),
      inspection('4', 'a', false),
    ];

    expect(inspectionOf('a', inspections)).toMatchObject({ id: '3' });
    expect(inspectionOf('c', inspections)).toBeNull();
    expect(inspectionOf('a', null)).toBeNull();
  });
});

describe('membershipStateOf', () => {
  it('says whether a membership runs, runs out within two weeks or ran out', () => {
    expect(membershipStateOf(null, NOW)).toBe('none');
    expect(membershipStateOf(NOW.plus({ days: 60 }).toSeconds(), NOW)).toBe('active');
    expect(membershipStateOf(NOW.plus({ days: 10 }).toSeconds(), NOW)).toBe('expiring');
    expect(membershipStateOf(NOW.minus({ days: 1 }).toSeconds(), NOW)).toBe('expired');
  });
});

describe('qualificationState', () => {
  it('is expired when the server says it no longer counts or its date has passed', () => {
    expect(qualificationState({ current: false, expiresAt: null }, NOW)).toBe('expired');
    expect(qualificationState({ current: true, expiresAt: '2026-10-01' }, NOW)).toBe('expired');
  });

  it('is expiring within two weeks, and current otherwise or without a date', () => {
    expect(qualificationState({ current: true, expiresAt: '2026-10-25' }, NOW)).toBe('expiring');
    expect(qualificationState({ current: true, expiresAt: '2027-10-25' }, NOW)).toBe('current');
    expect(qualificationState({ current: true, expiresAt: null }, NOW)).toBe('current');
  });
});

describe('actingOf', () => {
  it('keeps the acting permissions in the order they show', () => {
    expect(
      actingOf([Permission.ActAsEquipmentInspector, Permission.ReadLoad, Permission.ActAsPilot])
    ).toEqual([Permission.ActAsPilot, Permission.ActAsEquipmentInspector]);
    expect(actingOf(null)).toEqual([]);
  });
});
