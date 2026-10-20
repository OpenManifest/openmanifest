import type * as React from 'react';
import { usePreferences } from 'app/state/preferences';
import ManifestScreen from 'app/screens/authenticated/manifest/manifest/ManifestScreen';
import LoadScreen from 'app/screens/authenticated/manifest/load/LoadScreen';
import BoardScreen from './BoardScreen';

type BoardScreens = {
  Board: React.ComponentType<any>;
  Load: React.ComponentType<any>;
};

const CLASSIC: BoardScreens = { Board: ManifestScreen, Load: LoadScreen };

/**
 * The new board and load screens, registered by the tasks that build them (U3.3 the board, U3.5 the load). A screen that is not built yet
 * falls back to the classic one, so the `newBoard` preference can be on while the new screens arrive one by one.
 */
export const NEW_SCREENS: Partial<BoardScreens> = { Board: BoardScreen };

/** The screens the manifest stack renders for the `newBoard` preference */
export function useBoardScreens(): BoardScreens {
  const newBoard = usePreferences((preferences) => preferences.newBoard);
  return newBoard ? { ...CLASSIC, ...NEW_SCREENS } : CLASSIC;
}
