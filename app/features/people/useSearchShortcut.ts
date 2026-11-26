import * as React from 'react';
import { Platform, type TextInput } from 'react-native';
import { isSearchShortcut } from './people';

/**
 * On the web, "/" moves to the search box while `enabled` (the screen is in front): not while typing in a field, and not
 * behind a dialog that is open over the screen.
 */
export default function useSearchShortcut(
  input: React.RefObject<TextInput | null>,
  enabled: boolean
) {
  React.useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || typeof document === 'undefined') return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSearchShortcut(event)) return;
      if (document.querySelector('[role="dialog"], [aria-modal="true"], [role="menu"]')) return;
      event.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled, input]);
}
