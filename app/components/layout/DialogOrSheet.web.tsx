import * as React from 'react';
import { Button, Dialog, IconButton, ProgressBar, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { Drawer, Typography } from '@mui/material';

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
  const { buttonLabel, disablePadding, buttonAction, title, loading, open, children, onClose } =
    props;
  const theme = useTheme();

  return (
    <Drawer {...{ open, onClose }} anchor="right" PaperProps={{ style: { width: 400 } }}>
      <ProgressBar
        indeterminate
        color={theme?.colors?.primary}
        visible={loading}
        style={{ width: '100%' }}
      />
      {!title ? null : (
        <Typography
          variant="h5"
          style={{ marginBottom: 16, paddingLeft: 16, paddingRight: 16, marginTop: 16 }}
        >
          {title}
          <IconButton icon="close" style={styles.close} size={24} onPress={onClose} />
        </Typography>
      )}
      <View style={{ padding: disablePadding ? 0 : 16, paddingBottom: 0 }}>{children}</View>
      <Dialog.Actions
        style={{ justifyContent: 'flex-end', backgroundColor: 'transparent', marginBottom: 16 }}
      >
        <Button
          mode="contained"
          disabled={loading}
          {...{ loading }}
          onPress={buttonAction}
          style={styles.button}
        >
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
