import { startOfDay } from 'date-fns';
import * as React from 'react';
import { useAppSelector } from '../../state';
import { useQueryDropzone } from '../reflection';
import useMutationUpdateUser from './useMutationUpdateUser';

export default function useDropzoneContext() {
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const pushToken = useAppSelector((root) => root.global.expoPushToken);

  const currentDropzone = useQueryDropzone({
    variables: {
      dropzoneId: Number(dropzoneId),
      earliestTimestamp: startOfDay(new Date()).toISOString(),
    },
    fetchPolicy: 'cache-first',
  });

  const mutationUpdateUser = useMutationUpdateUser({
    onSuccess: () => null,
    onError: () => null,
  });

  // Update remote push token if we have a local token, but no
  // token saved on the server. This is done so that the server
  // is able to send us push notifications
  React.useEffect(() => {
    const userId = currentDropzone?.data?.dropzone?.currentUser?.user?.id;
    const remoteToken = currentDropzone?.data?.dropzone?.currentUser?.user?.pushToken;
    const localToken = pushToken;

    if (!currentDropzone.loading && currentDropzone.called) {
      if (localToken && localToken !== remoteToken && userId) {
        mutationUpdateUser.mutate({
          id: Number(userId),
          pushToken: localToken,
        });
      }
    }
  }, [
    pushToken,
    currentDropzone?.data?.dropzone?.currentUser?.user?.pushToken,
    currentDropzone?.data?.dropzone?.currentUser?.user?.id,
    currentDropzone.loading,
    currentDropzone.called,
    mutationUpdateUser,
  ]);

  return {
    ...currentDropzone,
    dropzone: currentDropzone?.data?.dropzone,
    currentUser: currentDropzone?.data?.dropzone?.currentUser,
  };
}
