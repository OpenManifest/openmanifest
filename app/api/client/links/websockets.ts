import * as ActionCable from '@rails/actioncable';
import { useSession } from 'app/state';
import { getServerUrl } from '../utils/getServerUrl';
import { buildCableUrl, reconnectOnCredentialChange } from '../utils/cable';
import ActionCableLink from '../utils/ActionCableLink';

export const hasSubscriptionOperation = ({ query: { definitions } }) => {
  return definitions.some(
    ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription'
  );
};

export function createWebsocketsLink() {
  // The consumer calls the function whenever it opens a connection, so it always sees the current credentials
  const cable = ActionCable.createConsumer(() =>
    buildCableUrl(getServerUrl(), useSession.getState().credentials)
  );
  reconnectOnCredentialChange(cable);

  return new ActionCableLink({
    cable,
    connectionParams: (a) => {
      const { authHeaders } = a.getContext();
      return authHeaders;
    },
  });
}
