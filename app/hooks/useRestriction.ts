import * as React from 'react';
import { Permission } from '../api/schema.d';
import { useCurrentUserPermissionsLazyQuery } from '../api/reflection';
import { useAppSelector } from '../state';

export default function useRestriction(permission: Permission): boolean {
  const { currentDropzoneId } = useAppSelector((root) => root.global);

  const [execute, { data }] = useCurrentUserPermissionsLazyQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
    },
  });

  React.useEffect(() => {
    if (currentDropzoneId) {
      execute({
        variables: {
          dropzoneId: Number(currentDropzoneId),
        },
      });
    }
  }, [currentDropzoneId, execute]);

  const permissions = data?.dropzone?.currentUser?.permissions || [];
  return permissions?.includes(permission as Permission) || false;
}
