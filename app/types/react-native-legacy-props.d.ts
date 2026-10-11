// react-native-paper 4's bundled typings `Pick<>` two props that React Native 0.76 removed from its types
// (`tvParallaxProperties` on View, `onTextInput` on TextInput). A Pick of a missing key yields a *required* property, so
// every <Divider />, <Appbar.Content /> or <TextInput /> fails to compile. Declaring them as optional restores the old
// shape. Remove this file when react-native-paper is upgraded to 5 (P3.11).
import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    tvParallaxProperties?: unknown;
  }
  interface TextInputProps {
    onTextInput?: unknown;
  }
}
