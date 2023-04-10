import * as React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Dialog, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { Portal } from '@gorhom/portal';
import { DrawerActions, useNavigation } from '@react-navigation/core';
import { StyleSheet, View } from 'react-native';

interface IBottomSheetProps {
  open?: boolean;
  title?: string;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  disablePadding?: boolean;

  snapPoints?: (string | number)[];
  buttonAction?(): void;
  onClose(): void;
}

function CloseOnUnmount({ onUnmount }: { onUnmount: () => void }) {
  React.useEffect(() => {
    return () => {
      onUnmount();
    };
  }, [onUnmount]);
  return <View />;
}

function DialogOrSheet(props: IBottomSheetProps) {
  const { buttonLabel, disablePadding, buttonAction, title, loading, open, children, onClose } = props;
  const navigation = useNavigation();
  const theme = useTheme();

  React.useEffect(() => {
    if (open) {
      console.log('Opening drawer');
      navigation.dispatch(DrawerActions.openDrawer());
    } else {
      console.log('Closing drawer');
      navigation.dispatch(DrawerActions.closeDrawer());
    }
  }, [navigation, onClose, open]);

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
      <Dialog.Content pointerEvents="box-none" style={styles.noPadding}>
        <Dialog.ScrollArea
          style={StyleSheet.flatten([
            disablePadding ? styles.noPadding : styles.defaultPadding,
            { paddingTop: title ? 24 : 0 }
          ])}
        >
          <ScrollView>{children}</ScrollView>
        </Dialog.ScrollArea>
      </Dialog.Content>
      <Dialog.Actions style={{ justifyContent: 'flex-end' }}>
        <Button mode="contained" onPress={buttonAction} style={styles.button}>
          {buttonLabel}
        </Button>
      </Dialog.Actions>
      <CloseOnUnmount onUnmount={onClose} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  noPadding: { borderBottomWidth: 0, paddingLeft: 0, paddingRight: 0 },
  defaultPadding: { borderBottomWidth: 0, paddingLeft: 24, paddingRight: 24 },
  button: {
    width: '100%',
    padding: 5,
    alignSelf: 'flex-end',
    borderRadius: 20,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  close: { position: 'absolute', top: 4, right: 4 }
});

export default React.memo(DialogOrSheet, (prev, next) => prev.open === next.open);
