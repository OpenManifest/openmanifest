import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';

import { Permission } from 'app/api/schema.d';
import DropzoneForm from 'app/forms/dropzone/DropzoneForm';
import useRestriction from 'app/hooks/useRestriction';
import { Screen } from 'app/components/layout';
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
    <>
      <ProgressBar indeterminate color={theme.colors.primary} visible={loading} />
      <Screen fullWidth={false}>
        <DropzoneForm {...{ loading, control }} />
      </Screen>
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        visible={Boolean(canUpdateDropzone && formState.isDirty)}
        disabled={!formState.isDirty || loading}
        small
        icon="check"
        onPress={onSubmit}
        label="Save"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    display: 'flex',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    marginTop: 0,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  fields: {
    width: '100%',
    marginBottom: 16,
  },
  field: {
    marginBottom: 8,
  },
});
