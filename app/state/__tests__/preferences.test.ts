import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREFERENCES_STORAGE_KEY, usePreferences } from '../preferences';

describe('newBoard preference', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    usePreferences.setState({ newBoard: true });
  });

  it('is on for a new install', async () => {
    await usePreferences.persist.rehydrate();

    expect(usePreferences.getState().newBoard).toBe(true);
  });

  it('is off for preferences stored before the flag existed, which keep their other values', async () => {
    await AsyncStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ state: { colorScheme: 'dark', density: 'compact' }, version: 1 })
    );

    await usePreferences.persist.rehydrate();

    expect(usePreferences.getState()).toMatchObject({
      newBoard: false,
      colorScheme: 'dark',
      density: 'compact',
    });
  });

  it('keeps the choice made in Account', async () => {
    usePreferences.getState().setNewBoard(false);
    await usePreferences.persist.rehydrate();

    expect(usePreferences.getState().newBoard).toBe(false);
    expect(JSON.parse((await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)) ?? '{}').version).toBe(
      2
    );
  });
});
