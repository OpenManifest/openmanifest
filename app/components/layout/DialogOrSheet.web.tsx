import * as React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Dialog, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { Portal } from '@gorhom/portal';
import { DrawerActions, useNavigation } from '@react-navigation/core';
import { StyleSheet } from 'react-native';

interface IBottomSheetProps {
  open?: boolean;
  title?: string;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  disablePadding?: boolean;

  // eslint-disable-next-line react/no-unused-prop-types
  snapPoints?: (string | number)[];
  buttonAction?(): void;
  onClose(): void;
}

export default function DialogOrSheet(props: IBottomSheetProps) {
  const { buttonLabel, disablePadding, buttonAction, title, loading, open, children, onClose } =
    props;
  const navigation = useNavigation();
  const theme = useTheme();

  React.useEffect(() => {
    if (open) {
      navigation.dispatch(DrawerActions.openDrawer());
    } else {
      navigation.dispatch(DrawerActions.closeDrawer());
    }
  }, [navigation, open]);

  if (!open) {
    return null;
  }

  return (
    <Portal hostName="drawer">
      <ProgressBar indeterminate color={theme?.colors?.primary} visible={loading} />
      {!title ? null : (
        <Dialog.Title numberOfLines={1}>
          {title}
          <IconButton icon="close" style={styles.close} size={24} onPress={onClose} />
        </Dialog.Title>
      )}
      <Dialog.Content
        pointerEvents="box-none"
        style={disablePadding ? styles.noPadding : undefined}
      >
        <Dialog.ScrollArea style={disablePadding ? styles.noPadding : undefined}>
          <ScrollView>{children}</ScrollView>
        </Dialog.ScrollArea>
      </Dialog.Content>
      <Dialog.Actions style={{ justifyContent: 'flex-end' }}>
        <Button mode="contained" onPress={buttonAction} style={styles.button}>
          {buttonLabel}
        </Button>
      </Dialog.Actions>
    </Portal>
  );
}

const styles = StyleSheet.create({
  noPadding: { paddingLeft: 0, paddingRight: 0 },
  button: {
    width: '100%',
    padding: 5,
    alignSelf: 'flex-end',
    borderRadius: 20,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  close: { position: 'absolute', top: 4, right: 4 },
});
