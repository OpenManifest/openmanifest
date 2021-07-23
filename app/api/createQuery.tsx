import { DocumentNode, useQuery } from "@apollo/client";
import { Maybe } from "graphql/jsutils/Maybe";
import * as React from "react";
import { Query } from "../api/schema";
import { actions, useAppDispatch } from "../state";

export interface IAppQuery<Payload, InputType> {
  data: Maybe<Payload>,
  loading: boolean;
  refetch(variables?: InputType): void;
}

export interface IAppQueryProps<Payload, InputType> {
  onError?(message: string): void;
  pollInterval?: number;
  showSnackbarErrors?: boolean;
  variables?: InputType;
}

export function createQuery<Payload extends any, InputType extends {}>(
  query: DocumentNode,
  options: {
    getPayload(query?: Query): Maybe<Payload>;
  }
) {
  const { getPayload } = options;

  return function useAppQuery(opts: IAppQueryProps<Payload, InputType>): IAppQuery<Payload, InputType> {
    const { variables, pollInterval, onError } = opts
    const dispatch = useAppDispatch();
    
    const { data, loading, previousData, refetch, error } = useQuery(query, {
      variables,
      pollInterval
    });

    const transformedData = React.useMemo(() => getPayload(data), [JSON.stringify(data)]);

    React.useEffect(() => {
      const hasChanged = JSON.stringify(previousData) !== JSON.stringify(data);
      if (error?.message) {
        if (opts.showSnackbarErrors !== false) {
          dispatch(
            actions.notifications.showSnackbar({ message: error.message, variant: "error" })
          );
        }

        if (onError) {
          (error.message);
        }
      }
      
    }, [opts.onError, error?.message])
    

    return {
      loading,
      data: transformedData,
      refetch,
    }    
  }
}