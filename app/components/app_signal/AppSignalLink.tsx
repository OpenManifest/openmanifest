import {
  ApolloError,
  ApolloLink,
  FetchResult,
  NextLink,
  Operation,
  ServerError,
} from '@apollo/client/core';
import { ErrorResponse, onError as createErrorLink } from '@apollo/client/link/error';
import Observable from 'zen-observable';
import AppSignal from '@appsignal/javascript';
import type { Breadcrumb } from '@appsignal/types';
import { GraphQLError, OperationDefinitionNode, print } from 'graphql';

export interface IAppSignalLinkOptions {
  breadcrumbs: {
    includeQuery?: boolean;
    includeResponse?: boolean;
    includeVariables?: boolean;
  };
  excludeOperation?(operation: Operation): boolean;
  excludeError?(error: GraphQLError): boolean;
  ignore?(errors: ErrorResponse): boolean;
}

const DEFAULT_OPTIONS: IAppSignalLinkOptions = {
  breadcrumbs: {
    includeQuery: false,
    includeResponse: false,
    includeVariables: false,
  },
  excludeOperation: () => false,
  excludeError: () => false,
};

function isServerError(error: unknown): error is ServerError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'result' in error &&
    'statusCode' in error
  );
}

function getDefinition(operation: Operation): OperationDefinitionNode {
  return operation.query.definitions.find(
    (q) => q.kind === 'OperationDefinition'
  ) as OperationDefinitionNode;
}

function createBreadCrumb(operation: Operation): Breadcrumb {
  const definition = getDefinition(operation);
  const operationName = definition.name?.value;
  return {
    message: operationName,
    category: `graphql.${definition.operation}`,
    action: operation.operationName,
    timestamp: Math.floor(new Date().getTime() / 1000),
    metadata: {},
  };
}

function createAppSignalErrorLink(
  client: AppSignal,
  options: IAppSignalLinkOptions = DEFAULT_OPTIONS
): ApolloLink {
  return createErrorLink((errors) => {
    const { graphQLErrors, operation, response } = errors;
    if (options?.ignore?.(errors)) {
      return;
    }

    if (graphQLErrors) {
      const filteredErrors = graphQLErrors.filter((err) => !options?.excludeError?.(err));

      // Rethrow errors not in the whitelist
      if (filteredErrors.length) {
        const breadcrumb = createBreadCrumb(operation);
        breadcrumb.metadata ??= {};
        const definition = getDefinition(operation);
        // Always include query, variables and response on errors
        const query = definition.loc?.source?.body ?? print(definition);
        const { variables } = operation;
        breadcrumb.metadata.query = query;
        breadcrumb.metadata.variables = JSON.stringify(variables, null, 2);

        if (isServerError(response)) {
          const { result } = response;

          breadcrumb.metadata.statusCode = response?.response?.status;
          breadcrumb.metadata.response = JSON.stringify(result, null, 2);
        }

        client?.addBreadcrumb(breadcrumb);

        try {
          client?.sendError(new Error(filteredErrors.map((err) => err.message).join(', ')));
        } catch (e) {
          console.debug('Error', e);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        response.errors = null;
      }
    }
  });
}
export class AppSignalBreadcrumbLink extends ApolloLink {
  private readonly options: IAppSignalLinkOptions;

  private readonly client?: AppSignal;

  constructor(client: AppSignal, options: IAppSignalLinkOptions) {
    super();
    this.client = client;
    this.options = { ...DEFAULT_OPTIONS, ...(options || {}) };
  }

  request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    const { options } = this;

    // If this operation should be excluded, continue
    if (options.excludeOperation?.(operation) ?? false) {
      return forward(operation);
    }

    const breadcrumb = createBreadCrumb(operation);

    // While this could be done more simplistically by simply subscribing,
    // wrapping the observer in our own observer ensures we get the results
    // before they are passed along to other observers. This guarantees we
    // get to run our instrumentation before others observers potentially
    // throw and thus flush the results to Sentry.
    return new Observable<FetchResult>((originalObserver) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          breadcrumb.metadata ??= {};
          if (options?.breadcrumbs?.includeResponse) {
            // We must have a breadcrumb if attachBreadcrumbs was set
            breadcrumb.metadata.response = JSON.stringify(result, null, 2);
          }

          if (options?.breadcrumbs?.includeQuery) {
            const definition = getDefinition(operation);
            // Always include query, variables and response on errors
            breadcrumb.metadata.query = definition.loc?.source?.body ?? print(definition);
          }

          if (options?.breadcrumbs?.includeVariables) {
            // Always include query, variables and response on errors
            breadcrumb.metadata.variables = JSON.stringify(operation.variables || {}, null, 2);
          }

          originalObserver.next(result);
        },
        complete: () => {
          this.client?.addBreadcrumb(breadcrumb);
          originalObserver.complete();
        },
        error: (error) => {
          breadcrumb.metadata ??= {};
          const definition = getDefinition(operation);
          // Always include query, variables and response on errors
          const query = definition.loc?.source?.body ?? print(definition);
          const { variables } = operation;
          breadcrumb.metadata.query = query;
          breadcrumb.metadata.variables = JSON.stringify(variables, null, 2);

          if (isServerError(error)) {
            const { result, response } = error;

            breadcrumb.metadata.statusCode = response?.status;
            breadcrumb.metadata.response = JSON.stringify(result, null, 2);
          }

          this.client?.addBreadcrumb(breadcrumb);

          originalObserver.error(error);
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }
}

export default function createAppSignalLink(
  client: AppSignal,
  options: IAppSignalLinkOptions
): ApolloLink {
  return ApolloLink.from([
    new AppSignalBreadcrumbLink(client, options),
    createAppSignalErrorLink(client, options),
  ]);
}
