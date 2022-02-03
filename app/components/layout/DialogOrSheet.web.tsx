import * as React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Dialog, Portal, ProgressBar } from 'react-native-paper';
import { useAppSelector } from '../../state';

interface IBottomSheetProps {
  open?: boolean;
  title?: string;
  buttonLabel?: string;
  children: React.ReactNode;
  loading?: boolean;

  // eslint-disable-next-line react/no-unused-prop-types
  snapPoints?: (string | number)[];
  buttonAction?(): void;
  onClose(): void;
}

export default function DialogOrSheet(props: IBottomSheetProps) {
  const { buttonLabel, buttonAction, title, loading, open, children, onClose } = props;
  const globalState = useAppSelector((root) => root.global);

  return (
    <Portal>
      <Dialog visible={!!open} dismissable={false} style={{ maxWidth: 500, alignSelf: 'center' }}>
        <ProgressBar indeterminate visible={loading} color={globalState.theme.colors.primary} />
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content pointerEvents="box-none">
          <Dialog.ScrollArea>
            <ScrollView>{children}</ScrollView>
          </Dialog.ScrollArea>
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: 'flex-end' }}>
          <Button
            onPress={() => {
              onClose();
            }}
          >
            Cancel
          </Button>

          <Button onPress={buttonAction}>{buttonLabel}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
