import * as React from 'react';
import { FAB } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';

import { Permission } from 'app/api/schema.d';
import OperatorForm from 'app/forms/operator/OperatorForm';
import useRestriction from 'app/hooks/useRestriction';
import FormColumn from 'app/components/layout/FormColumn';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { useNotifications } from 'app/providers/notifications';
import useOperatorForm from 'app/forms/operator/useForm';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

export default function UpdateOperatorScreen() {
  const { theme } = useAppTheme();
  const notify = useNotifications();

  const { control, formState, onSubmit, loading } = useOperatorForm({
    onSuccess: () => {
      notify.success('Your changes have been saved');
    },
  });

  const canUpdateOperator = useRestriction(Permission.UpdateOperator);

  return (
    <ScreenContainer edges={['bottom']}>
      <ProgressBar indeterminate color={theme.colors.primary} visible={loading} />
      <FormColumn>
        <OperatorForm {...{ loading, control }} />
      </FormColumn>
      <FloatingActionArea>
        <FAB
          labelMaxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          testID="save-operator-primary-action"
          style={{ backgroundColor: theme.colors.primary }}
          visible={Boolean(canUpdateOperator && formState.isDirty)}
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
