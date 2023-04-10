import * as React from 'react';
import isEqual from 'lodash/isEqual';
import difference from 'lodash/difference';
import { FieldError } from '../schema.d';

export type InferArguments<Func> = Func extends (arg: infer Argument) => unknown ? Argument : never;
type CRUDHook<Args extends object, Value extends object> = (args: Args) => Value;
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
  | MutationSuccessResponse
  | IMutationFailureResponse;

const DEBUG_PROVIDERS = false;
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
  Hook extends CRUDHook<Args, Value>
>(useHook: Hook, INITIAL_STATE: ReturnType<Hook>) {
  const Context = React.createContext<ReturnType<Hook>>(INITIAL_STATE);

  function Provider(props: React.PropsWithChildren<InferHookArguments<Hook>>) {
    const { children, ...rest } = props;
    const value = useHook(rest as InferHookArguments<Hook>) as ReturnType<Hook>;
    const old = React.useRef<typeof value>(value);

    // Leaving these in for debugging if needed later,
    // just flip DEBUG_PROVIDERS to true
    React.useEffect(() => {
      if (DEBUG_PROVIDERS) {
        console.debug(useHook.name, 'mounted');
        return () => {
          console.debug(useHook.name, 'unmounted');
        };
      }
      return undefined;
    }, []);

    // Print debugging information
    React.useEffect(() => {
      if (DEBUG_PROVIDERS) {
        if (JSON.stringify(value) !== JSON.stringify(old.current)) {
          console.debug(useHook.name, '[CRUD Hook] Re-rendering because of state change: ', {
            old: old.current,
            new: value
          });
          console.debug(useHook.name, '[CRUD Hook] Previous: ', old.current);
          console.debug(useHook.name, '[CRUD Hook] Current: ', value);
          difference(Object.values(old.current), Object.values(value)).forEach((key) => {
            console.debug('DIFF IN ', key);
          });
          old.current = value;
        }
      }
    }, [value]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContext() {
    return React.useContext(Context);
  }

  return { Provider: React.memo(Provider, isEqual), useContext, Context, INITIAL_STATE };
}
