import { useUnseenNotificationsQuery } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers/operator/context';

/** How often the badge asks again while the app is open; a push or a visit to the inbox refreshes it sooner */
export const UNSEEN_POLL_MS = 60_000;

/** The number of notifications the member has not read, for the badge of the Inbox */
export default function useUnseenCount(): number {
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const { data } = useUnseenNotificationsQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id || !currentUser?.id,
    pollInterval: UNSEEN_POLL_MS,
    fetchPolicy: 'cache-and-network',
  });
  return data?.operator?.currentUser?.unseenNotifications ?? 0;
}
