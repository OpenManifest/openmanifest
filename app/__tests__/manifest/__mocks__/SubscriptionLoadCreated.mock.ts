import { MockedResponse } from '@apollo/client/testing';
import { LoadCreatedDocument } from '../../../api/reflection';

// The screen subscribes to new loads; the tests never emit one.
export default function mockSubscriptionLoadCreated(dropzoneId = '1'): MockedResponse {
  return {
    request: { query: LoadCreatedDocument, variables: { dropzoneId } },
    result: { data: { loadCreated: { __typename: 'LoadCreatedPayload', load: null } } },
  };
}
