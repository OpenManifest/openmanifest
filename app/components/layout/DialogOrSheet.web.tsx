import * as React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Dialog, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import Drawer from '@mui/material/drawer';

interface IBottomSheetProps {
  open?: boolean;
  title?: string;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  disablePadding?: boolean;

  // eslint-disable-next-line react/no-unused-prop-types
  snapPoints?: (string | number)[];
  scrollable?: boolean;
  buttonAction?(): void;
  onClose(): void;
}

function DialogOrSheet(props: IBottomSheetProps) {
  const {
    buttonLabel,
    disablePadding,
    scrollable,
    buttonAction,
    title,
    loading,
    open,
    children,
    onClose,
  } = props;
  const theme = useTheme();

  return (
    <Drawer
      {...{ open, onClose }}
      anchor="right"
      PaperProps={{ style: { width: 400, overflowY: 'hidden' } }}
    >
      <ProgressBar
        indeterminate
        color={theme?.colors?.primary}
        visible={loading}
        style={{ width: '100%' }}
      />
      {!title ? null : (
        <Dialog.Title numberOfLines={1}>
          {title}
          <IconButton icon="close" style={styles.close} size={24} onPress={onClose} />
        </Dialog.Title>
      )}
      <Dialog.Content
        pointerEvents="box-none"
        style={[
          styles.noPadding,
          scrollable !== false ? {} : { height: 'calc(100% - 80px)', paddingBottom: 0 },
        ]}
      >
        {scrollable !== false ? (
          <Dialog.ScrollArea
            style={StyleSheet.flatten([
              disablePadding ? styles.noPadding : styles.defaultPadding,
              { paddingTop: title ? 24 : 0 },
            ])}
          >
            <ScrollView>{children}</ScrollView>
          </Dialog.ScrollArea>
        ) : (
          children
        )}
      </Dialog.Content>
      <Dialog.Actions style={{ justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
        <Button mode="contained" onPress={buttonAction} style={styles.button}>
          {buttonLabel}
        </Button>
      </Dialog.Actions>
    </Drawer>
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
    marginTop: 20,
  },
  close: { position: 'absolute', top: 4, right: 4 },
});

export default DialogOrSheet;
