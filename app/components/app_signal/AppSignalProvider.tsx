import { plugin as AppSignalCurrentPath } from '@appsignal/plugin-path-decorator';
import { plugin as AppSignalWindowEvents } from '@appsignal/plugin-window-events';
import * as React from 'react';
import type { JSSpan } from '@appsignal/types';
import isEqual from 'lodash/isEqual';
import AppSignalClient from './AppSignalClient';
import AppSignalBoundary from './AppSignalBoundary';
import AppSignalContext, {
  IAppSignalContext,
  IAppSignalDefaultTags,
  INITIAL_CONTEXT,
  INITIAL_TAGS,
} from './AppSignalContext';

export default function AppSignalProvider(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const [tags, setTags] = React.useState<IAppSignalDefaultTags & { [key: string]: string }>(
    INITIAL_CONTEXT.tags
  );
  React.useEffect(() => {
    AppSignalClient.use(AppSignalWindowEvents);
    AppSignalClient.use(AppSignalCurrentPath);
  }, []);

  const onUpdateTags = React.useCallback(
    (newTags: Partial<IAppSignalDefaultTags>) => {
      setTags({ ...tags, ...newTags });
    },
    [tags]
  );

  const value: IAppSignalContext = React.useMemo(
    () => ({ appSignal: AppSignalClient, tags, setTags: onUpdateTags }),
    [tags, onUpdateTags]
  );

  const onTagsChanged = React.useCallback(
    (span: JSSpan) => {
      if (isEqual(tags, INITIAL_TAGS)) {
        return span;
      }
      return span.setTags(tags);
    },
    [tags]
  );

  React.useEffect(() => {
    AppSignalClient?.addDecorator(onTagsChanged);
  }, [onTagsChanged]);

  return (
    <AppSignalContext.Provider {...{ value }}>
      <AppSignalBoundary>{children}</AppSignalBoundary>
    </AppSignalContext.Provider>
  );
}
