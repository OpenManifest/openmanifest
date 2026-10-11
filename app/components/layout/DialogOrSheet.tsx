import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import Sheet from './Sheet';

interface IBottomSheetProps {
  open?: boolean;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
  disablePadding?: boolean;

  scrollable?: boolean;
  handle?: React.ReactNode;

  buttonAction?(): void;
  onClose(): void;
}

/** A sheet with a form and one action button below it (a drawer on web) */
export default function DialogOrSheet(props: IBottomSheetProps) {
  const {
    open,
    disablePadding,
    onClose,
    title,
    buttonLabel,
    buttonAction,
    handle,
    loading,
    children,
  } = props;

  return (
    <Sheet {...{ open, onClose, title, handle, disablePadding }}>
      {children}
      <Button onPress={buttonAction} mode="contained" style={styles.button} loading={loading}>
        {buttonLabel}
      </Button>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    padding: 5,
    alignSelf: 'flex-end',
    borderRadius: 20,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});
