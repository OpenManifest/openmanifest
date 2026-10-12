import { MockedResponse } from '@apollo/client/testing';
import { LoadCreatedDocument } from '../../../api/reflection';

// The screen subscribes to new loads; the tests never emit one.
export default function mockSubscriptionLoadCreated(operatorId = '1'): MockedResponse {
  return {
    request: { query: LoadCreatedDocument, variables: { operatorId } },
    result: { data: { loadCreated: { __typename: 'LoadCreatedPayload', load: null } } },
  };
}
