import { useAppSelector } from '../../state';
import { useQueryDropzoneUserProfile } from '../reflection';
import useCurrentDropzone from './useCurrentDropzone';

// Returns current user if no ID is provided
export default function useDropzoneUser(id?: number) {
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);
  const currentDropzone = useCurrentDropzone();

  const dropzoneUser = useQueryDropzoneUserProfile({
    variables: {
      dropzoneId: Number(dropzoneId),
      dropzoneUserId: id || Number(currentDropzone?.data?.dropzone?.currentUser?.id),
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    ...dropzoneUser,
    dropzoneUser:
      !id || id === Number(currentDropzone?.data?.dropzone?.currentUser?.id)
        ? currentDropzone?.data?.dropzone?.currentUser
        : dropzoneUser?.data?.dropzone?.dropzoneUser,
  };
}
