import * as React from 'react';
import { Keyboard } from 'react-native';

export default function useKeyboardVisibility() {
  const [visible, setVisible] = React.useState(false);
  const onKeyboardVisible = React.useCallback(() => setVisible(true), []);
  const onKeyboardHidden = React.useCallback(() => setVisible(false), []);

  React.useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', onKeyboardVisible);
    const hideListener = Keyboard.addListener('keyboardDidHide', onKeyboardHidden);

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, [onKeyboardHidden, onKeyboardVisible]);

  return visible;
}
