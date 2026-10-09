import React from 'react';
import { resetSession } from 'app/state/resetSession';

export function useLogout() {
  return React.useCallback(() => resetSession({ reason: 'logout' }), []);
}
