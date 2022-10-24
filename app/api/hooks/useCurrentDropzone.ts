import { startOfDay } from 'date-fns';
import { isEqual } from 'lodash';
import * as React from 'react';
import { useAppSelector } from '../../state';
import { DropzoneQueryVariables } from '../operations';
import { useDropzoneLazyQuery } from '../reflection';
import useMutationUpdateUser from './useMutationUpdateUser';

export default function useDropzoneContext() {
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const pushToken = useAppSelector((root) => root.global.expoPushToken);

  const [getDropzone, query] = useDropzoneLazyQuery();
  const variables: DropzoneQueryVariables = React.useMemo(
    () => ({
      dropzoneId: Number(dropzoneId),
      earliestTimestamp: startOfDay(new Date()).toISOString(),
    }),
    [dropzoneId]
  );

  React.useEffect(() => {
    if (variables?.dropzoneId && !isEqual(variables, query?.variables)) {
      getDropzone({ variables });
    }
  }, [getDropzone, query?.variables, variables]);

  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: () => null,
    onError: () => null,
  });

  // Update remote push token if we have a local token, but no
  // token saved on the server. This is done so that the server
  // is able to send us push notifications
  React.useEffect(() => {
    const userId = query?.data?.dropzone?.currentUser?.id;
    const remoteToken = query?.data?.dropzone?.currentUser?.user?.pushToken;
    const localToken = pushToken;

    if (!query.loading && query.called) {
      if (localToken && localToken !== remoteToken && userId) {
        mutationUpdateUser.mutate({
          dropzoneUser: Number(userId),
          pushToken: localToken,
        });
      }
    }
  }, [
    pushToken,
    query?.data?.dropzone?.currentUser?.user?.pushToken,
    query?.data?.dropzone?.currentUser?.id,
    query.loading,
    query.called,
    mutationUpdateUser,
  ]);

  return {
    ...query,
    dropzone: query?.data?.dropzone,
    currentUser: query?.data?.dropzone?.currentUser,
  };
}
