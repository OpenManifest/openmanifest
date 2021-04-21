import { DocumentNode, useQuery } from "@apollo/client";
import { Maybe } from "graphql/jsutils/Maybe";
import { useCallback, useEffect, useMemo } from "react";
import { FieldError, Query } from "../graphql/schema";
import { snackbarActions, useAppDispatch } from "../redux";

export interface IAppQuery<Payload, InputType> {
  data: Maybe<Payload>,
  loading: boolean;
  refetch(variables?: InputType): void;
}

export interface IAppQueryProps<Payload, InputType> {
  onError?(message: string): void;
  showSnackbarErrors?: boolean;
  variables?: InputType;
}

export function createQuery<Payload extends {}, InputType extends {}>(
  query: DocumentNode,
  options: {
    getPayload(query?: Query): Maybe<Payload>;
  }
) {
  const { getPayload } = options;

  return function useAppQuery(opts: IAppQueryProps<Payload, InputType>): IAppQuery<Payload, InputType> {
    const { variables, onError } = opts
    const dispatch = useAppDispatch();
    
    const { data, loading, previousData, refetch, error } = useQuery(query, {
      variables,
    });

    const transformedData = useMemo(() => getPayload(data), [JSON.stringify(data)]);

    useEffect(() => {
      const hasChanged = JSON.stringify(previousData) !== JSON.stringify(data);
      if (error?.message) {
        if (opts.showSnackbarErrors !== false) {
          dispatch(
            snackbarActions.showSnackbar({ message: error.message, variant: "error" })
          );
        }

        onError!(error.message);
      }
      
    }, [opts.onError, error?.message])
    

    return {
      loading,
      data: transformedData,
      refetch,
    }    
  }
}