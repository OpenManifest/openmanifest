import { useAppSelector } from '../../state';
import { useQueryDropzoneUserProfile } from '../reflection';

// Returns current user if no ID is provided
export default function useDropzoneUser(id: number) {
  const dropzoneId = useAppSelector((root) => root.global.currentDropzoneId);

  const dropzoneUser = useQueryDropzoneUserProfile({
    variables: {
      dropzoneId: dropzoneId?.toString() as string,
      dropzoneUserId: id,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    ...dropzoneUser,
    dropzoneUser: dropzoneUser?.data?.dropzone?.dropzoneUser,
  };
}
