import * as React from 'react';
import { useDropzoneUserProfileLazyQuery } from '../reflection';

// Returns current user if no ID is provided
export default function useDropzoneUser(id?: string) {
  const [getProfile, dropzoneUser] = useDropzoneUserProfileLazyQuery();
  React.useEffect(() => {
    if (id && dropzoneUser?.variables?.id !== id) {
      getProfile({
        variables: {
          id,
        },
      });
    }
  }, [id, dropzoneUser?.variables?.id, getProfile]);

  return {
    ...dropzoneUser,
    dropzoneUser: dropzoneUser?.data?.dropzoneUser,
  };
}
