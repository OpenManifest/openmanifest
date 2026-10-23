import { NotificationType } from 'app/api/schema.d';
import { iconOf, notificationsOf, pushDataOf, pushTargetOf, targetOf, titleKeyOf } from '../inbox';
import { openPush, openTarget } from '../openTarget';

const load = { __typename: 'Load', id: '7', loadNumber: 3 } as never;
const slot = { __typename: 'Slot', id: '9', load: { id: '7', loadNumber: 3 } } as never;
const rig = { __typename: 'Equipment', id: '5', name: 'Rig', owner: { id: '12' } } as never;
const inspection = {
  __typename: 'EquipmentInspection',
  id: '6',
  equipment: { id: '5', name: 'Rig', owner: { id: '12' } },
} as never;
const transaction = { __typename: 'Transaction', id: '3', amountCents: 4000 } as never;

describe('targetOf', () => {
  it('opens the load of a call, of a cancelled call and of a booking', () => {
    expect(targetOf(NotificationType.Boarding, load)).toEqual({ screen: 'load', loadId: '7' });
    expect(targetOf(NotificationType.BoardingCanceled, load)).toEqual({
      screen: 'load',
      loadId: '7',
    });
    expect(targetOf(NotificationType.UserManifested, slot)).toEqual({
      screen: 'load',
      loadId: '7',
    });
  });

  it('opens Today when the load is not known', () => {
    expect(targetOf(NotificationType.Boarding, null)).toEqual({ screen: 'today' });
    expect(targetOf(NotificationType.MembershipUpdated, null)).toEqual({ screen: 'today' });
  });

  it('opens the wallet for money', () => {
    expect(targetOf(NotificationType.CreditsUpdated, transaction)).toEqual({ screen: 'wallet' });
  });

  it('opens the inspection a rig needs, and the owner of a rig that was inspected', () => {
    expect(targetOf(NotificationType.EquipmentInspectionRequested, rig)).toEqual({
      screen: 'inspection',
      equipmentId: '5',
      membershipId: '12',
    });
    expect(targetOf(NotificationType.EquipmentInspectionCompleted, inspection)).toEqual({
      screen: 'profile',
      membershipId: '12',
    });
    expect(targetOf(NotificationType.EquipmentInspectionCompleted, rig)).toEqual({
      screen: 'profile',
      membershipId: '12',
    });
  });

  it('stays in the inbox for the rest, and when what it is about is missing', () => {
    expect(targetOf(NotificationType.PermissionGranted, null)).toEqual({ screen: 'inbox' });
    expect(targetOf(NotificationType.PublicationRequested, null)).toEqual({ screen: 'inbox' });
    expect(targetOf(NotificationType.EquipmentInspectionRequested, null)).toEqual({
      screen: 'inbox',
    });
    expect(targetOf(undefined, null)).toEqual({ screen: 'inbox' });
  });
});

describe('pushTargetOf', () => {
  it.each([
    [NotificationType.Boarding, { screen: 'today' }],
    [NotificationType.BoardingCanceled, { screen: 'today' }],
    [NotificationType.UserManifested, { screen: 'today' }],
    [NotificationType.MembershipUpdated, { screen: 'today' }],
    [NotificationType.CreditsUpdated, { screen: 'wallet' }],
    [NotificationType.EquipmentInspectionRequested, { screen: 'inbox' }],
    [NotificationType.EquipmentInspectionCompleted, { screen: 'inbox' }],
    [NotificationType.PermissionGranted, { screen: 'inbox' }],
    [NotificationType.PermissionRevoked, { screen: 'inbox' }],
    [NotificationType.PublicationRequested, { screen: 'inbox' }],
    [NotificationType.PackjobConfirmed, { screen: 'inbox' }],
    [NotificationType.System, { screen: 'inbox' }],
    ['something_new', { screen: 'inbox' }],
    [undefined, { screen: 'inbox' }],
  ])('%s opens %j', (type, target) => {
    expect(pushTargetOf(type)).toEqual(target);
  });
});

describe('pushDataOf', () => {
  it('reads the id and the type a push carries', () => {
    expect(pushDataOf({ notificationId: 41, type: 'boarding' })).toEqual({
      notificationId: '41',
      type: 'boarding',
    });
    expect(pushDataOf({ notificationId: '41' })).toEqual({
      notificationId: '41',
      type: undefined,
    });
  });

  it('ignores what is not a push of ours', () => {
    expect(pushDataOf(null)).toEqual({});
    expect(pushDataOf('boarding')).toEqual({});
    expect(pushDataOf({ type: 4 })).toEqual({ notificationId: undefined, type: undefined });
  });
});

describe('openTarget and openPush', () => {
  it.each([
    [{ screen: 'today' }, { screen: 'Today' }],
    [{ screen: 'wallet' }, { screen: 'Wallet' }],
    [{ screen: 'inbox' }, { screen: 'Notifications' }],
    [
      { screen: 'load', loadId: '7' },
      {
        screen: 'Manifest',
        params: { screen: 'LoadScreen', params: { loadId: '7' }, initial: false },
      },
    ],
    [
      { screen: 'inspection', equipmentId: '5', membershipId: '12' },
      {
        screen: 'Users',
        params: {
          screen: 'EquipmentInspectionScreen',
          params: { equipmentId: '5', membershipId: '12' },
          initial: false,
        },
      },
    ],
    [
      { screen: 'profile', membershipId: '12' },
      {
        screen: 'Users',
        params: { screen: 'ProfileScreen', params: { userId: '12' }, initial: false },
      },
    ],
  ] as const)('opens %j', (target, params) => {
    const navigate = jest.fn();

    openTarget(navigate, target as never);

    expect(navigate).toHaveBeenCalledWith('Authenticated', params);
  });

  it('opens the screen of the type a push carries, and says what it carried', () => {
    const navigate = jest.fn();

    const push = openPush(navigate, { notificationId: 41, type: 'boarding' });

    expect(push).toEqual({ notificationId: '41', type: 'boarding' });
    expect(navigate).toHaveBeenCalledWith('Authenticated', { screen: 'Today' });
  });

  it('does nothing for a push that is not ours', () => {
    const navigate = jest.fn();

    expect(openPush(navigate, { other: true })).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('titles and icons', () => {
  it('names and draws each kind, and has a fallback', () => {
    expect(titleKeyOf(NotificationType.Boarding)).toBe('inbox.type.boarding');
    expect(titleKeyOf(NotificationType.System)).toBe('inbox.type.other');
    expect(iconOf(NotificationType.Boarding)).toBe('bullhorn-outline');
    expect(iconOf(undefined)).toBe('bell-outline');
  });

  it('lists the notifications of a query without the empty edges', () => {
    const data = {
      operator: {
        currentUser: { notifications: { edges: [{ node: { id: '1' } }, null, { node: null }] } },
      },
    } as never;

    expect(notificationsOf(data).map(({ id }) => id)).toEqual(['1']);
    expect(notificationsOf(undefined)).toEqual([]);
  });
});
