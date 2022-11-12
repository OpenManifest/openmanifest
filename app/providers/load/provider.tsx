import * as React from 'react';
import type { LoadQueryVariables } from 'app/api/operations';
import { useLoad } from 'app/api/crud';
import { TimePickerDialog } from './TimePickerDialog';
import { LoadContext } from './context ';
import createUseDialog from '../hooks/useDialog';

const useTimePickerDialog = createUseDialog();

function LoadContextProvider(props: React.PropsWithChildren<Partial<LoadQueryVariables>>) {
  const { children, ...variables } = props;
  const load = useLoad(variables);
  const timepicker = useTimePickerDialog();
  const dialogs = React.useMemo(() => ({ timepicker }), [timepicker]);

  const onChangeDispatchTime = React.useCallback(
    (time: number) => {
      load.dispatchAtTime(time).then(timepicker.close);
    },
    [load, timepicker.close]
  );

  const context = React.useMemo(
    () => ({
      load,
      dialogs,
    }),
    [load, dialogs]
  );
  return (
    <LoadContext.Provider value={context}>
      {children}
      <TimePickerDialog
        open={timepicker.visible}
        onClose={timepicker.close}
        onChange={onChangeDispatchTime}
      />
    </LoadContext.Provider>
  );
}

export function withLoadContext<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedWithLoad(props: T & Partial<LoadQueryVariables>) {
    const { id, ...rest } = props;
    return (
      <LoadContextProvider {...{ id }}>
        <Component {...(rest as T)} />
      </LoadContextProvider>
    );
  };
}

export { LoadContextProvider };
