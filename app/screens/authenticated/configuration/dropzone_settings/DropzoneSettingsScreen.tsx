import * as React from 'react';
import { FAB } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';

import { Permission } from 'app/api/schema.d';
import DropzoneForm from 'app/forms/dropzone/DropzoneForm';
import useRestriction from 'app/hooks/useRestriction';
import { Screen } from 'app/components/layout';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { useNotifications } from 'app/providers/notifications';
import useDropzoneForm from 'app/forms/dropzone/useForm';
import { useAppTheme } from 'app/theme';

export default function UpdateDropzoneScreen() {
  const { theme } = useAppTheme();
  const notify = useNotifications();

  const { control, formState, onSubmit, loading } = useDropzoneForm({
    onSuccess: () => {
      notify.success('Your changes have been saved');
    },
  });

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);

  return (
    <ScreenContainer edges={['bottom']}>
      <ProgressBar indeterminate color={theme.colors.primary} visible={loading} />
      <Screen fullWidth={false}>
        <DropzoneForm {...{ loading, control }} />
      </Screen>
      <FloatingActionArea>
        <FAB
          testID="save-dropzone-primary-action"
          style={{ backgroundColor: theme.colors.primary }}
          visible={Boolean(canUpdateDropzone && formState.isDirty)}
          disabled={!formState.isDirty || loading}
          small
          icon="check"
          onPress={onSubmit}
          label="Save"
        />
      </FloatingActionArea>
    </ScreenContainer>
  );
}
