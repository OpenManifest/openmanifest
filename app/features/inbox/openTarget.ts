import { pushDataOf, pushTargetOf, type Target } from './inbox';

type Navigate = (name: 'Authenticated', params: object) => void;

/**
 * Opens a target from anywhere with a navigate: the screens of the tabs, the load of a call, the inspection a rig needs.
 * The people screens open under People with the list beneath, as `useOpenUser` does.
 */
export function openTarget(navigate: Navigate, target: Target) {
  switch (target.screen) {
    case 'today':
      return navigate('Authenticated', { screen: 'Today' });
    case 'wallet':
      return navigate('Authenticated', { screen: 'Wallet' });
    case 'inbox':
      return navigate('Authenticated', { screen: 'Notifications' });
    case 'load':
      return navigate('Authenticated', {
        screen: 'Manifest',
        params: { screen: 'LoadScreen', params: { loadId: target.loadId }, initial: false },
      });
    case 'inspection':
      return navigate('Authenticated', {
        screen: 'Users',
        params: {
          screen: 'EquipmentInspectionScreen',
          params: { equipmentId: target.equipmentId, membershipId: target.membershipId },
          initial: false,
        },
      });
    case 'profile':
      return navigate('Authenticated', {
        screen: 'Users',
        params: {
          screen: 'ProfileScreen',
          params: { userId: target.membershipId },
          initial: false,
        },
      });
    default:
      return undefined;
  }
}

/**
 * What a tap on a push does: reads its data (`{ notificationId, type }`) and opens the screen of its type. Returns the
 * data when it was ours (and something was opened), so the caller can mark the notification read.
 */
export function openPush(navigate: Navigate, data: unknown) {
  const push = pushDataOf(data);
  if (!push.type && !push.notificationId) return null;
  openTarget(navigate, pushTargetOf(push.type));
  return push;
}
