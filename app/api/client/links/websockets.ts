import * as ActionCable from '@rails/actioncable';
import URI from 'urijs';
import { getServerUrl } from '../utils/getServerUrl';
import ActionCableLink from '../utils/ActionCableLink';

export const hasSubscriptionOperation = ({ query: { definitions } }) => {
  return definitions.some(
    ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription'
  );
};

export function createWebsocketsLink() {
  const cable = ActionCable.createConsumer(
    [
      new URI(getServerUrl()).scheme() === 'https' ? 'wss://' : 'ws://',
      new URI(getServerUrl()).host(),
      '/subscriptions',
    ].join('')
  );

  return new ActionCableLink({
    cable,
    connectionParams: (a) => {
      const { authHeaders } = a.getContext();
      return authHeaders;
    },
  });
}
