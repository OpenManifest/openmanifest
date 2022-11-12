import * as React from 'react';
import type { DropzoneQueryVariables } from 'app/api/operations';
import { useDropzone } from 'app/api/crud';
import { DropzoneContext } from './context';
import createUseDialog from '../hooks/useDialog';

const useTimePickerDialog = createUseDialog();

function DropzoneContextProvider(props: React.PropsWithChildren<Partial<DropzoneQueryVariables>>) {
  const { children, ...variables } = props;
  const dropzone = useDropzone(variables);
  const timepicker = useTimePickerDialog();
  const dialogs = React.useMemo(() => ({ timepicker }), [timepicker]);

  const context = React.useMemo(
    () => ({
      dropzone,
      dialogs,
    }),
    [dropzone, dialogs]
  );
  return <DropzoneContext.Provider value={context}>{children}</DropzoneContext.Provider>;
}

export function withDropzoneContext<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedWithLoad(props: T & Partial<DropzoneQueryVariables>) {
    const { dropzoneId, ...rest } = props;
    return (
      <DropzoneContextProvider {...{ dropzoneId }}>
        <Component {...(rest as T)} />
      </DropzoneContextProvider>
    );
  };
}

export { DropzoneContextProvider };
