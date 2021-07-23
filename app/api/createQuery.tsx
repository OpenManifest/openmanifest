import { DocumentNode, useQuery } from '@apollo/client';
import { Maybe } from 'graphql/jsutils/Maybe';
import * as React from 'react';
import { Query } from './schema';
import { actions, useAppDispatch } from '../state';

export interface IAppQuery<Payload, InputType> {
  data: Maybe<Payload>;
  loading: boolean;
  refetch(variables?: InputType): void;
}

export interface IAppQueryProps<InputType> {
  onError?(message: string): void;
  pollInterval?: number;
  showSnackbarErrors?: boolean;
  variables?: InputType;
}

export function createQuery<
  Payload extends Maybe<Record<string, unknown>>,
  InputType extends object
>(
  query: DocumentNode,
  options: {
    getPayload(query?: Query): Maybe<Payload>;
  }
) {
  const { getPayload } = options;

  return function useAppQuery(opts: IAppQueryProps<InputType>): IAppQuery<Payload, InputType> {
    const { variables, pollInterval, onError } = opts;
    const dispatch = useAppDispatch();

    const { data, loading, refetch, error } = useQuery(query, {
      variables,
      pollInterval,
    });

    const transformedData = React.useMemo(() => getPayload(data), [data]);

    React.useEffect(() => {
      if (error?.message) {
        if (opts.showSnackbarErrors !== false) {
          dispatch(
            actions.notifications.showSnackbar({
              message: error.message,
              variant: 'error',
            })
          );
        }

        onError?.(error.message);
      }
    }, [opts.onError, error?.message, opts.showSnackbarErrors, onError, dispatch]);

    return {
      loading,
      data: transformedData,
      refetch,
    };
  };
}
