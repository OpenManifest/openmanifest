import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import OperatorForm from 'app/forms/operator/OperatorForm';
import useOperatorForm from 'app/forms/operator/useForm';
import useRestriction from 'app/hooks/useRestriction';
import { useThemeOverrides } from 'app/theme';
import FormColumn from 'app/components/layout/FormColumn';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import { Button, Row, useTheme } from 'app/ui';

/**
 * Who the operator is and how it looks (Setup → Business → Branding, `/configuration/basic`): name, accepted bodies,
 * location, banner and colours. The save button shows once something changed.
 */
export default function BrandingScreen() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { control, formState, onSubmit, loading, reset } = useOperatorForm({});
  const canUpdateOperator = useRestriction(Permission.UpdateOperator);

  return (
    <ScreenContainer edges={['bottom']} testID="branding">
      <FormColumn contentContainerStyle={{ paddingTop: theme.space.lg }}>
        <OperatorForm {...{ loading, control }} />
      </FormColumn>
      {canUpdateOperator && formState.isDirty ? (
        <View
          style={{
            padding: theme.space.md,
            backgroundColor: theme.colour.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colour.border,
          }}
        >
          <Row gap="sm" justify="end" wrap>
            <Button
              label={t('rules.discard')}
              variant="tertiary"
              disabled={loading}
              onPress={() => {
                reset();
                // The colour previewed in the app goes back to the saved one
                useThemeOverrides.getState().setPrimary(null);
              }}
            />
            <Button
              label={t('rules.save')}
              icon="check"
              loading={loading}
              onPress={onSubmit}
              testID="save-operator-primary-action"
            />
          </Row>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
