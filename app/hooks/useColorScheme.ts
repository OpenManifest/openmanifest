import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

// The useColorScheme value is always either light or dark, but the built-in
// type suggests that it can be null (and React Native can report 'unspecified'). This makes it a bit easier to work
// with. react-native-web follows `prefers-color-scheme`, so no web variant is needed.
export default function useColorScheme(): NonNullable<ColorSchemeName> {
  return (_useColorScheme() ?? 'light') as NonNullable<ColorSchemeName>;
}
