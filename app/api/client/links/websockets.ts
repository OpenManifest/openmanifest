import { createConsumer } from '@rails/actioncable';
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink';
import URI from 'urijs';
import { getServerUrl } from '../utils/getServerUrl';

export const hasSubscriptionOperation = ({ query: { definitions } }) => {
  return definitions.some(
    ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription'
  );
};

export function createWebsocketsLink() {
  const cable = createConsumer(
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
