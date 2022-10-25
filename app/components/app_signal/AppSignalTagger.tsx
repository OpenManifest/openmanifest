import * as React from 'react';
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
import { useAppSelector } from 'app/state';
import { Platform } from 'react-native';
import { useAppSignalContext, INITIAL_TAGS } from './AppSignalContext';

function AppSignalSessionTagProvider(props: React.PropsWithChildren<object>) {
  const { children } = props;

  // This can be undefined here because this bondary
  // is rendered at the top of the app to catch errors
  // outside of GraphQL as wele
  const { dropzone, currentUser: currentDropzoneUser } = useDropzoneContext();
  const { currentRouteName, currentUser, currentDropzoneId } = useAppSelector(
    (state) => state.global
  );
  const { tags, setTags } = useAppSignalContext();

  const sessionTags: { [key: string]: string } = React.useMemo(
    () => ({
      ...INITIAL_TAGS,
      currentDropzoneId: (dropzone?.id || currentDropzoneId || 'Unknown')?.toString(),
      currentDropzone: dropzone?.name || 'Unknown',
      currentRouteName: currentRouteName || 'Unknown',
      currentUser: (currentDropzoneUser?.id || currentUser?.id || 'Unknown')?.toString(),
      platform: Platform.OS as string,
    }),
    [
      currentDropzoneId,
      currentDropzoneUser?.id,
      currentRouteName,
      currentUser?.id,
      dropzone?.id,
      dropzone?.name,
    ]
  );

  React.useEffect(() => {
    // Update tags only if they're different
    const currentSessionTags = pick(tags, Object.keys(sessionTags));
    if (!isEqual(currentSessionTags, sessionTags)) {
      // Prevent this component from resetting tags when the GraphQL store
      // gets wiped on an error:
      if (isEqual(tags, INITIAL_TAGS) || !isEqual({ ...tags, ...sessionTags }, INITIAL_TAGS)) {
        setTags(sessionTags);
      }
    }
  }, [sessionTags, setTags, tags]);

  return children as JSX.Element;
}

export default AppSignalSessionTagProvider;
