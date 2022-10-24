import * as React from 'react';
import { ErrorBoundary } from '@appsignal/react';
import { useAppSignalContext } from './AppSignalContext';
import DefaultErrorBoundary from './AppSignalFallbackBoundary';
import ErrorScreen from './ErrorScreen';

function AppSignalBoundary(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const { appSignal: instance, tags } = useAppSignalContext();

  // Render children until we have an instance ready and use a
  // default error boundary to catch it in the meantime and still
  // display the fallback page
  if (!instance) {
    return <DefaultErrorBoundary fallback={<ErrorScreen />}>{children}</DefaultErrorBoundary>;
  }
  return (
    <ErrorBoundary {...{ instance, tags }} fallback={() => <ErrorScreen />}>
      {children}
    </ErrorBoundary>
  );
}

export default AppSignalBoundary;
