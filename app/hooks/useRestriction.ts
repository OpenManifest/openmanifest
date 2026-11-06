import { useOperatorContext } from 'app/providers/operator/context';
import { Permission } from '../api/schema.d';

export default function useRestriction(permission: Permission): boolean {
  const {
    operator: { permissions },
  } = useOperatorContext();

  const check = permissions?.includes(permission as Permission) || false;
  return check;
}
