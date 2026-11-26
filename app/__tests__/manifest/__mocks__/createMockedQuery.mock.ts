import { MockedResponse } from '@apollo/client/testing';
import { DocumentNode, GraphQLRequest } from '@apollo/client';
import cloneDeep from 'lodash/cloneDeep';
import mergeWith from 'lodash/mergeWith';
import { getOperationName } from '@apollo/client/utilities';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * The response with the overrides on top, as a new object: the shared fixture is never changed, so a test cannot leak
 * its overrides into the next, and a list in the overrides replaces the fixture's list (lodash `merge` would merge the
 * two by index).
 */
function override<Response>(data: Response, overrides: DeepPartial<Response>): Response {
  return mergeWith(cloneDeep(data), overrides, (_current: unknown, source: unknown) =>
    Array.isArray(source) ? source : undefined
  );
}

export default function createMockedQuery<Variables extends Record<string, unknown>, Response>(
  query: DocumentNode,
  variables: Variables,
  data: Response
): (
  overrideVariables?: Partial<Variables>,
  overrideResponse?: DeepPartial<Response>
) => MockedResponse<Record<string, unknown>> & {
  request: GraphQLRequest & { variables: Variables };
} {
  return (overrideVariables?: Partial<Variables>, overrideResponse?: DeepPartial<Response>) => ({
    request: {
      operationName: getOperationName(query) || 'NO NAME FOUND',
      query,
      variables: overrideVariables ? { ...variables, ...overrideVariables } : variables,
    },
    result: {
      data: (overrideResponse ? override(data, overrideResponse) : data) as Record<string, unknown>,
    },
  });
}
