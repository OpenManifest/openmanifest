import { useDropzoneContext } from 'app/api/crud/useDropzone';
import { Permission } from '../api/schema.d';

export default function useRestriction(permission: Permission): boolean {
  const { permissions } = useDropzoneContext();

  const check = permissions?.includes(permission as Permission) || false;
  return check;
}
