import { useDropzoneContext } from 'app/providers/dropzone/context';
import { Permission } from '../api/schema.d';

export default function useRestriction(permission: Permission): boolean {
  const {
    dropzone: { permissions },
  } = useDropzoneContext();

  const check = permissions?.includes(permission as Permission) || false;
  return check;
}
