import { MockedResponse } from '@apollo/client/testing';
import { DocumentNode, GraphQLRequest } from '@apollo/client';
import merge from 'lodash/merge';
import { getOperationName } from '@apollo/client/utilities';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export default function createMockedQuery<Variables extends Record<string, unknown>, Response>(
  query: DocumentNode,
  variables: Variables,
  data: Response
): (
  overrideVariables?: Partial<Variables>,
  overrideResponse?: DeepPartial<Response>
) => MockedResponse<Omit<Response, 'request'>> & {
  request: GraphQLRequest & { variables: Variables };
} {
  return (overrideVariables?: Partial<Variables>, overrideResponse?: DeepPartial<Response>) => ({
    request: {
      operationName: getOperationName(query) || 'NO NAME FOUND',
      query,
      variables: overrideVariables ? { ...variables, ...overrideVariables } : variables,
    },
    result: {
      data: overrideResponse ? merge(data, overrideResponse) : data,
    },
  });
}
