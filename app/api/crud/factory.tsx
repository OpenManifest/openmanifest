import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { FieldError } from '../schema.d';

export type InferArguments<Func> = Func extends (arg: infer Argument) => unknown ? Argument : never;
type CRUDHook<Args extends object, Value extends object> =
  ((args?: Args) => Value) | ((args: Args) => Value);
type InferHookArguments<Hook> = Hook extends CRUDHook<infer Arguments, object> ? Arguments : never;

export const uninitializedHandler = async (args?: unknown) => undefined as unknown;

// Streamline mutation results
export interface IMutationSuccessResponse<T> {
  note: T;
}

export interface IMutationFailureResponse {
  fieldErrors?: FieldError[];
  error?: string;
}

export type TMutationResponse<MutationSuccessResponse extends { [key: string]: object }> =
  MutationSuccessResponse | IMutationFailureResponse;

/**
 * Create a context for the CRUD operations
 * to allow using it further down the tree without
 * remounting the same hooks
 *
 * Usage:
 * createCRUDContext<typeof useHook>({ onUpdate: noop, onDelete: noop })
 */
export default function createCRUDContext<
  Args extends object,
  Value extends object,
  Hook extends CRUDHook<Args, Value>,
>(useHook: Hook, INITIAL_STATE: ReturnType<Hook>) {
  const Context = React.createContext<ReturnType<Hook>>(INITIAL_STATE);

  function Provider(props: React.PropsWithChildren<InferHookArguments<Hook>>) {
    const { children, ...rest } = props;
    const value = useHook(rest as InferHookArguments<Hook>) as ReturnType<Hook>;

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext() {
    return React.useContext(Context);
  }

  return { Provider: React.memo(Provider, isEqual), useContext, Context, INITIAL_STATE };
}
